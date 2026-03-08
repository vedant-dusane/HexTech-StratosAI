"""Decision API endpoints — thin handlers, logic lives in service layer."""
from collections.abc import AsyncGenerator

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.decision import (
    DecisionCreate, DecisionListResponse, DecisionRead, DecisionSummary, StatsResponse,
)
from app.services.decision_service import DecisionService

router = APIRouter(prefix="/decisions", tags=["decisions"])


def svc(db: AsyncSession = Depends(get_db)) -> DecisionService:
    return DecisionService(db)


@router.get("/stats", response_model=StatsResponse)
async def get_stats(service: DecisionService = Depends(svc)):
    return await service.stats()


@router.get("", response_model=DecisionListResponse)
async def list_decisions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    service: DecisionService = Depends(svc),
):
    items, total = await service.list_all(page, page_size)
    return DecisionListResponse(
        items=[DecisionSummary.model_validate(d) for d in items],
        total=total, page=page, page_size=page_size,
    )


@router.post("", response_model=DecisionRead, status_code=status.HTTP_201_CREATED)
async def create_decision(payload: DecisionCreate, service: DecisionService = Depends(svc)):
    d = await service.create(payload)
    return DecisionRead.model_validate(d)


@router.get("/{did}", response_model=DecisionRead)
async def get_decision(did: str, service: DecisionService = Depends(svc)):
    d = await service.get(did)
    if not d:
        raise HTTPException(404, "Decision not found")
    return DecisionRead.model_validate(d)


@router.get("/{did}/analyze")
async def analyze(did: str, service: DecisionService = Depends(svc)):
    """Stream agent analysis via Server-Sent Events (text/event-stream)."""
    if not await service.get(did):
        raise HTTPException(404, "Decision not found")

    async def stream() -> AsyncGenerator[str, None]:
        async for event in service.run_analysis(did):
            yield event.to_sse()

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )


@router.delete("/{did}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_decision(did: str, service: DecisionService = Depends(svc)):
    if not await service.delete(did):
        raise HTTPException(404, "Decision not found")