# StratosAI — Strategic Business Intelligence Platform

> **6 specialized AI agents** analyze every strategic decision and deliver a confidence-scored **VERDICT** in real time via a live streaming pipeline.

Built by **Team HexTech** for **Hackanova 5.0** — Thakur College of Engineering & Technology.

---

## The Problem

Business decisions fail not from lack of data — but from incomplete analysis. A founding team sees the upside. No one stress-tests the downside. No one models the numbers. No one maps who holds the veto.

StratosAI runs every decision through 6 specialized agents so nothing gets missed.

---

## How It Works

Six agents run **sequentially**, each receiving all prior outputs as context, building a layered analysis before the Strategist delivers the final call:

```
Scout → Devil → Oracle → Quant → Diplomat → Strategist
```

| Agent | Role | What it produces |
|-------|------|-----------------|
| 🔭 **Scout** | Context extraction | Stakeholders, constraints, data gaps, hidden assumptions |
| 😈 **Devil** | Risk analysis | Top 3 failure modes with probabilities, bear case, stress test |
| 🔮 **Oracle** | Market intelligence | Historical precedents, domain base rates, contrarian view |
| 📐 **Quant** | Financial modeling | NPV / IRR / payback — bull, base, and bear scenarios |
| 🤝 **Diplomat** | Stakeholder mapping | Influence map, veto holders, engagement sequence |
| 🎯 **Strategist** | Synthesis | **VERDICT: PROCEED / DELAY / DECLINE** + CONFIDENCE% |

---

## Sample Analysis

**Input:**
> Should we acquire a struggling competitor with 50K users and $1.2M ARR for $3M cash, or build their 3 key features in-house over 6 months? Our cash position is $9M. The competitor has 3 critical integrations that would take 12+ months to rebuild. Their NPS is 61 vs our 48. We have a 4-person engineering team at 80% capacity.

**Output (Strategist — Final Verdict):**
```
VERDICT: PROCEED
CONFIDENCE: 78%

RATIONALE: Acquisition delivers immediate access to 3 strategic integrations
at a 2.5x cost advantage over in-house build. NPS gap (61 vs 48) represents
a retention risk that accelerates if competitor recovers. At $3M against $9M
cash, downside is bounded; upside is compounding.

TOP 3 CONDITIONS FOR SUCCESS:
1. Integration audit within 30 days — confirm no hidden technical debt
2. Retention offer for competitor's top 2 engineers before close
3. Kill-switch: <40% user retention at Month 3 triggers immediate pivot

ALTERNATIVE PATH: Delay 45 days to complete integration audit and reduce
bear-case probability from 34% to ~18%.

DECISION DEADLINE: 21 days — competitor has a second interested acquirer.
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion |
| State | Zustand · TanStack React Query |
| Backend | FastAPI · Python 3.11 · SQLAlchemy async · Pydantic v2 |
| Streaming | Server-Sent Events (SSE) — live agent output as it generates |
| Database | SQLite (dev) → PostgreSQL (prod) |
| AI Model | Claude API · 6-agent pipeline · tenacity retry |
| CI/CD | GitHub Actions |

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- An AI API key (OpenRouter, Anthropic, or compatible)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
cp .env.example .env
# Edit .env — add your API key
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

| URL | Description |
|-----|-------------|
| http://localhost:5173 | StratosAI frontend |
| http://localhost:8000/docs | FastAPI interactive docs |
| http://localhost:8000/health | Health check |

---

## Project Structure

```
stratosai/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   └── orchestrator.py      <- 6-agent pipeline + LLM calls
│   │   ├── api/v1/
│   │   │   └── decisions.py         <- REST endpoints + SSE stream
│   │   ├── core/
│   │   │   ├── config.py            <- Pydantic settings
│   │   │   └── database.py          <- Async SQLAlchemy engine
│   │   ├── models/decision.py       <- ORM models
│   │   ├── schemas/decision.py      <- Pydantic v2 schemas
│   │   ├── services/
│   │   │   └── decision_service.py  <- Business logic layer
│   │   └── main.py                  <- FastAPI app factory
│   ├── .env.example
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/
        │   ├── decisions/            <- AgentPipeline, AnalysisOutput, etc.
        │   └── dashboard/            <- StatsBar
        ├── hooks/
        │   └── useAnalysisStream.ts  <- SSE streaming hook
        ├── stores/useAppStore.ts     <- Zustand global state
        └── lib/api.ts                <- Typed API client
```

---

## Environment Variables

```env
# AI Provider
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=anthropic/claude-3-haiku
OPENROUTER_MAX_TOKENS=1200

# App
APP_ENV=development
DATABASE_URL=sqlite+aiosqlite:///./stratosai.db
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Team

| Name | Role |
|------|------|
| Vedant Dusane | Team Lead |
| Arnav Kumar | Member |
| Saqlain Abidi | Member |
| Sumit Ghavri | Member |

**Institute:** Thakur College of Engineering & Technology
**Event:** Hackanova 5.0 · Software Track · Agentic AI
**Contact:** vibgroy28@gmail.com
