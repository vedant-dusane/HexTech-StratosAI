# StratosAI — Strategic Business Intelligence Platform

> 6 specialized AI agents analyze every strategic decision and deliver a ranked recommendation with confidence score in real time.

## Team HexTech

| Name | Role |
|------|------|
| Vedant Dusane | Team Lead |
| Arnav Kumar | Member |
| Saqlain Abidi | Member |
| Sumit Ghavri | Member |

*Thakur College of Engineering & Technology — Hackanova 5.0*

## Stack

| Layer | Technology |
|-------|-----------| 
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS · Framer Motion |
| State | Zustand · TanStack React Query |
| Backend | FastAPI · Python 3.11 · SQLAlchemy (async) · Pydantic v2 |
| Database | SQLite (dev) → PostgreSQL (prod) |
| AI Model | Claude API (Anthropic) · claude-sonnet · SSE streaming · tenacity retry |
| CI/CD | GitHub Actions |

## Quick Start

```bash
# Backend
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt && cp .env.example .env
# Add your ANTHROPIC_API_KEY to .env
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

API docs: http://localhost:8000/docs  
Frontend: http://localhost:5173

## Architecture

Six AI agents run sequentially, each building on prior outputs:

| Agent | Role |
|-------|------|
| **Scout** | Context extraction — stakeholders, constraints, data gaps |
| **Devil** | Risk analysis — failure modes, stress tests, bear case |
| **Oracle** | Market intelligence — precedents, base rates, timing |
| **Quant** | Financial modeling — NPV/IRR, bull/bear/base scenarios |
| **Diplomat** | Stakeholder mapping — influence, veto risk, engagement |
| **Strategist** | Synthesis — VERDICT + CONFIDENCE% + conditions |
