"""
6-agent AI orchestration engine.
Agents run sequentially, each receiving all prior outputs as context.
Streams SSEEvent objects consumed by FastAPI StreamingResponse.
"""
from __future__ import annotations

import re
import time
from collections.abc import AsyncGenerator
from dataclasses import dataclass

from openai import AsyncOpenAI
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import settings
from app.core.logging import get_logger
from app.schemas.decision import SSEEvent

log = get_logger(__name__)


@dataclass
class Agent:
    name:        str
    agent_type:  str
    emoji:       str
    color:       str
    description: str
    system:      str


AGENTS: list[Agent] = [
    Agent(
        name="Scout", agent_type="context_extraction",
        emoji="🔭", color="#4A90D9",
        description="Extracts variables, stakeholders, constraints & data gaps",
        system="""You are Scout, a business context analyst for strategic decision intelligence.
Extract structured intelligence from the decision brief in 5-7 sentences:
1. Core decision: what is actually being decided, and what options exist
2. Key stakeholders and their roles / interests
3. Hard constraints (budget, timeline, regulatory, technical)
4. Data quality: what is solid vs. estimated vs. missing
5. Hidden assumptions embedded in the framing
Be precise. Flag information gaps explicitly.""",
    ),
    Agent(
        name="Devil", agent_type="risk_analysis",
        emoji="😈", color="#E05050",
        description="Stress-tests assumptions and identifies failure modes",
        system="""You are Devil's Advocate — an adversarial risk analyst. Be the hardest critic.

Scout's findings:
{scout}

Deliver structured risk assessment:
- Top 3 failure modes with estimated probabilities (%)
- Which core assumptions, if wrong, collapse the entire decision
- Bear-case scenario and its trigger conditions
- Stress test: at what metric threshold does this decision fail?
- One concrete mitigation per failure mode
Be ruthlessly honest. Optimism bias kills companies.""",
    ),
    Agent(
        name="Oracle", agent_type="market_intelligence",
        emoji="🔮", color="#9B72CF",
        description="Pattern-matches against historical precedents",
        system="""You are Oracle — a market intelligence and historical pattern-matching agent.

Prior context:
{prior}

Deliver:
- 2-3 comparable historical decisions and their outcomes
- Domain base rate: what % of similar decisions succeed?
- Timing: is now the right moment given broader market conditions?
- What the competitive landscape tells us
- One contrarian view the consensus is missing""",
    ),
    Agent(
        name="Quant", agent_type="financial_modeling",
        emoji="📐", color="#52B788",
        description="NPV/IRR modelling and scenario analysis",
        system="""You are Quant — a financial modelling and quantitative analysis agent.

Prior context:
{prior}

Build a rapid model (show all assumptions):
- Base case: NPV, IRR, payback period
- Bull case (+25% on key driver): same metrics
- Bear case (-40% on key driver): same metrics
- Top 2 sensitivities (what moves NPV the most?)
- Break-even analysis
- Capital efficiency: return per dollar invested""",
    ),
    Agent(
        name="Diplomat", agent_type="stakeholder_mapping",
        emoji="🤝", color="#E8933A",
        description="Stakeholder influence, stance, engagement sequencing",
        system="""You are Diplomat — a stakeholder intelligence and political analysis agent.

Prior context:
{prior}

Map the human terrain:
- Key stakeholders: influence (H/M/L), stance (for/against/neutral), primary concern
- Who holds veto power and how do you neutralize it?
- Who is the critical champion needed?
- Recommended engagement sequence with rationale
- One political risk that doesn't appear in any financial model""",
    ),
    Agent(
        name="Strategist", agent_type="synthesis",
        emoji="🎯", color="#5BB8D4",
        description="Synthesizes all inputs into the final recommendation",
        system="""You are Strategist — chief decision synthesis agent. All agents have reported.

COMPLETE ANALYSIS:
{prior}

Synthesize into an executive-ready recommendation:

VERDICT: [PROCEED / DELAY / DECLINE]
CONFIDENCE: [XX%]

RATIONALE: (2-3 decisive sentences grounded in the analysis above)

TOP 3 CONDITIONS FOR SUCCESS:
1. ...
2. ...
3. ...

ALTERNATIVE PATH: If primary verdict fails, what is Plan B?

DECISION DEADLINE: When must this be decided and why?

Be decisive. CEOs need a clear answer, not more ambiguity.""",
    ),
]


class AgentOrchestrator:
    def __init__(self) -> None:
        self._client: AsyncOpenAI | None = (
            AsyncOpenAI(
                api_key=settings.OPENROUTER_API_KEY,
                base_url="https://openrouter.ai/api/v1",
            )
            if settings.OPENROUTER_API_KEY else None
        )
        if not self._client:
            log.warning("no_api_key", msg="Using mock responses — set OPENROUTER_API_KEY in .env")

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(min=2, max=10), reraise=True)
    async def _llm(self, system: str, user: str) -> tuple[str, int, int]:
        if not self._client:
            return _mock(system), 0, 0
        msg = await self._client.chat.completions.create(
            model=settings.OPENROUTER_MODEL,
            max_tokens=settings.OPENROUTER_MAX_TOKENS,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
        )
        text = msg.choices[0].message.content
        pt   = msg.usage.prompt_tokens
        ct   = msg.usage.completion_tokens
        return text, pt, ct

    async def run(
        self, decision_id: str, context: str, domain: str
    ) -> AsyncGenerator[SSEEvent, None]:
        outputs: dict[str, str] = {}

        yield SSEEvent(type="pipeline_start", data={"decision_id": decision_id, "total": len(AGENTS)})

        for idx, agent in enumerate(AGENTS):
            yield SSEEvent(type="agent_start", data={
                "agent_name": agent.name, "emoji": agent.emoji,
                "color": agent.color, "description": agent.description, "index": idx,
            })

            prior = "\n\n".join(f"[{k}]:\n{v}" for k, v in outputs.items()) or "None yet."
            system = agent.system.format(
                prior=prior[:3000],
                scout=outputs.get("Scout", "")[:800],
            )

            t0 = time.perf_counter()
            err: str | None = None
            try:
                text, pt, ct = await self._llm(system, f"Domain: {domain}\n\n{context}")
            except Exception as e:
                err = str(e)
                text = f"[Agent error: {err}]"
                pt = ct = 0
                log.error("agent_error", agent=agent.name, error=err)

            ms = int((time.perf_counter() - t0) * 1000)
            outputs[agent.name] = text
            conf = _parse_confidence(text) if agent.name == "Strategist" else 0.0

            yield SSEEvent(type="agent_done", data={
                "agent_name": agent.name, "emoji": agent.emoji, "color": agent.color,
                "output": text, "error": err, "duration_ms": ms,
                "prompt_tokens": pt, "completion_tokens": ct,
                "confidence": conf, "index": idx,
                "progress": (idx + 1) / len(AGENTS),
            })

        final = outputs.get("Strategist", "")
        yield SSEEvent(type="pipeline_complete", data={
            "decision_id": decision_id,
            "recommendation": final,
            "confidence": _parse_confidence(final),
            "all_outputs": outputs,
        })


def _parse_confidence(text: str) -> float:
    m = re.search(r"CONFIDENCE:\s*(\d{1,3})%", text, re.IGNORECASE)
    if m:
        return min(float(m.group(1)) / 100, 1.0)
    m = re.search(r"(\d{1,3})%", text)
    return float(m.group(1)) / 100 if m else 0.75


def _mock(system: str) -> str:
    """Realistic mock responses when no API key is configured."""
    if "Scout" in system:
        return ("Context: Market expansion decision with $2.4M budget ceiling, Q3 deadline.\n"
                "Stakeholders: CFO (gatekeeper), CTO (champion), Sales VP (at-risk quota).\n"
                "Constraints: 18-month payback threshold, GDPR compliance, legacy integration limit 6 months.\n"
                "Data quality: HIGH for financials, MEDIUM for market sizing, LOW for competitive pricing.\n"
                "Missing: EU legal opinion, churn baseline, competitor pricing data.")
    if "Devil" in system:
        return ("FAILURE MODE 1: Adoption lag — Probability 34%, Impact CRITICAL.\n"
                "FAILURE MODE 2: Integration delays — Probability 41%, Impact MEDIUM.\n"
                "FAILURE MODE 3: Key-person dependency — Probability 28%, Impact HIGH.\n"
                "Stress test: At 60% adoption, IRR drops to 7.2% — below 12% hurdle rate.\n"
                "Mitigations: kill-switch at Month 3; 2-week technical spike pre-contract; succession plan.")
    if "Oracle" in system:
        return ("Comparable 1: Salesforce EU expansion 2019 — 73% profile match, 31% ARR growth.\n"
                "Comparable 2: HubSpot mid-market pivot — 18-month payback with segment focus.\n"
                "Base rate: 61% success when VP champion + integration <6 months + price <15% IT budget.\n"
                "Current profile: 2/3 criteria met.\n"
                "Contrarian: First-movers in downturns capture 40% more market share at recovery.")
    if "Quant" in system:
        return ("BASE CASE: NPV $4.7M @ 12% discount | IRR 18.4% | Payback Month 14\n"
                "Assumptions: 70% adoption, 8% churn, $240K implementation cost\n"
                "BULL (+25% adoption): NPV $8.2M | IRR 31.2% | Payback Month 9\n"
                "BEAR (delays + 40% churn): NPV -$0.9M | IRR -3.1%\n"
                "Top sensitivity: adoption rate ±1σ = ±$2.1M NPV impact\n"
                "Capital efficiency: $1 invested → $2.97 over 3 years.")
    if "Diplomat" in system:
        return ("CFO: HIGH influence, MEDIUM support — payback period is the concern. VETO RISK.\n"
                "CTO: HIGH influence, HIGH support — technical champion. Needs arch sign-off.\n"
                "Sales VP: MEDIUM influence, LOW support — fears Q2 quota disruption.\n"
                "Engagement: CTO Day 1 → CFO Day 3 → Sales VP Day 5 → Board Day 14.\n"
                "Hidden risk: Sales VP has informal board relationship — hallway conversation is the highest soft risk.")
    return ("VERDICT: PROCEED\nCONFIDENCE: 78%\n\n"
            "RATIONALE: Positive NPV ($4.7M) and IRR above hurdle (18.4% vs 12%). Risk profile manageable "
            "with kill-switch and phased rollout. Stakeholder path navigable with CTO as champion.\n\n"
            "TOP 3 CONDITIONS:\n1. CFO alignment on 14-month payback model by Week 3\n"
            "2. Phased rollout: Segment A only in Q2, full rollout Q3 pending Month-3 adoption\n"
            "3. Kill-switch: <25% adoption at Month 3 triggers mandatory pause\n\n"
            "ALTERNATIVE PATH: Delay 1 quarter to gather competitive pricing data — reduces bear-case risk 40%.\n"
            "DECISION DEADLINE: 14 days — Q2 budget lock closes after that.")


orchestrator = AgentOrchestrator()