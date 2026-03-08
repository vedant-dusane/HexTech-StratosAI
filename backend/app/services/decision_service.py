"""Business logic for decisions — keeps route handlers thin."""
from __future__ import annotations
from collections.abc import AsyncGenerator
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.agents.orchestrator import AGENTS, orchestrator
from app.core.logging import get_logger
from app.models.decision import ActivityLog, AgentRun, AgentStatus, Decision, DecisionStatus
from app.schemas.decision import DecisionCreate, SSEEvent, StatsResponse

log = get_logger(__name__)


class DecisionService:
    def __init__(self, db: AsyncSession) -> None:
        self.db = db

    async def create(self, payload: DecisionCreate) -> Decision:
        decision = Decision(
            title=payload.title, context=payload.context,
            domain=payload.domain, urgency=payload.urgency,
            status=DecisionStatus.QUEUED,
        )
        self.db.add(decision)
        await self.db.flush()

        for ag in AGENTS:
            self.db.add(AgentRun(
                decision_id=decision.id,
                agent_name=ag.name,
                agent_type=ag.agent_type,
                status=AgentStatus.IDLE,
            ))

        await self._log(decision.id, f"Decision '{payload.title}' queued")
        await self.db.commit()
        # Re-fetch with relationships eagerly loaded to avoid greenlet lazy-load error
        return await self.get(decision.id)

    async def get(self, did: str) -> Decision | None:
        result = await self.db.execute(
            select(Decision).where(Decision.id == did)
            .options(selectinload(Decision.agent_runs), selectinload(Decision.activity_logs))
        )
        return result.scalar_one_or_none()

    async def list_all(self, page: int = 1, page_size: int = 20) -> tuple[list[Decision], int]:
        base  = select(Decision).order_by(Decision.created_at.desc())
        total = (await self.db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
        rows  = (await self.db.execute(base.offset((page - 1) * page_size).limit(page_size))).scalars().all()
        return list(rows), total

    async def delete(self, did: str) -> bool:
        d = await self.get(did)
        if not d:
            return False
        await self.db.delete(d)
        await self.db.commit()
        return True

    async def stats(self) -> StatsResponse:
        total     = (await self.db.execute(select(func.count(Decision.id)))).scalar_one()
        complete  = (await self.db.execute(select(func.count(Decision.id)).where(Decision.status == DecisionStatus.COMPLETE))).scalar_one()
        analyzing = (await self.db.execute(select(func.count(Decision.id)).where(Decision.status == DecisionStatus.ANALYZING))).scalar_one()
        avg_c     = (await self.db.execute(select(func.avg(Decision.confidence)).where(Decision.confidence > 0))).scalar_one() or 0.0
        runs      = (await self.db.execute(select(func.count(AgentRun.id)).where(AgentRun.status == AgentStatus.DONE))).scalar_one()
        return StatsResponse(
            total_decisions=total, completed=complete, analyzing=analyzing,
            avg_confidence=round(float(avg_c) * 100, 1),
            total_agent_runs=runs,
            success_rate=round(complete / total * 100, 1) if total else 0.0,
        )

    async def run_analysis(self, did: str) -> AsyncGenerator[SSEEvent, None]:
        decision = await self.get(did)
        if not decision:
            yield SSEEvent(type="error", data={"message": "Not found"})
            return

        decision.status = DecisionStatus.ANALYZING
        await self.db.commit()
        await self._log(did, "🚀 Pipeline started")

        async for event in orchestrator.run(did, decision.context, decision.domain):
            if event.type == "agent_start":
                run = await self._run(did, event.data["agent_name"])
                if run:
                    run.status     = AgentStatus.RUNNING
                    run.started_at = datetime.now(timezone.utc)
                    await self.db.commit()

            elif event.type == "agent_done":
                run = await self._run(did, event.data["agent_name"])
                if run:
                    run.status            = AgentStatus.ERROR if event.data.get("error") else AgentStatus.DONE
                    run.output            = event.data["output"]
                    run.error             = event.data.get("error")
                    run.duration_ms       = event.data["duration_ms"]
                    run.prompt_tokens     = event.data["prompt_tokens"]
                    run.completion_tokens = event.data["completion_tokens"]
                    run.completed_at      = datetime.now(timezone.utc)
                    await self.db.commit()
                await self._log(did, f"✅ {event.data['agent_name']} done ({event.data['duration_ms']}ms)", agent_name=event.data["agent_name"])

            elif event.type == "pipeline_complete":
                decision.status         = DecisionStatus.COMPLETE
                decision.confidence     = event.data["confidence"]
                decision.recommendation = event.data["recommendation"]
                decision.completed_at   = datetime.now(timezone.utc)
                await self.db.commit()
                await self._log(did, "🎯 Analysis complete", level="success")

            yield event

    async def _run(self, did: str, name: str) -> AgentRun | None:
        r = await self.db.execute(
            select(AgentRun).where(AgentRun.decision_id == did, AgentRun.agent_name == name)
        )
        return r.scalar_one_or_none()

    async def _log(self, did: str, msg: str, level: str = "info", agent_name: str | None = None) -> None:
        self.db.add(ActivityLog(decision_id=did, level=level, message=msg, agent_name=agent_name))
        await self.db.commit()