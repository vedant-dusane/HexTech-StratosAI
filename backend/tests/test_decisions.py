"""Integration tests — run: cd backend && pytest tests/ -v"""
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


async def test_health(client):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


async def test_create_and_get(client):
    payload = {
        "title": "EU Market Expansion Q3",
        "context": "We are a $10M ARR SaaS considering EU expansion. Budget $500K. GDPR compliance required.",
        "domain": "strategy",
        "urgency": "high",
    }
    r = await client.post("/api/v1/decisions", json=payload)
    assert r.status_code == 201
    d = r.json()
    assert d["status"] == "queued"
    did = d["id"]

    r2 = await client.get(f"/api/v1/decisions/{did}")
    assert r2.status_code == 200
    assert r2.json()["id"] == did


async def test_list(client):
    r = await client.get("/api/v1/decisions")
    assert r.status_code == 200
    assert "items" in r.json() and "total" in r.json()


async def test_stats(client):
    r = await client.get("/api/v1/decisions/stats")
    assert r.status_code == 200
    assert "total_decisions" in r.json()


async def test_not_found(client):
    r = await client.get("/api/v1/decisions/does-not-exist")
    assert r.status_code == 404


async def test_delete(client):
    payload = {
        "title": "Delete me test",
        "context": "Test context with enough words for the validator to pass.",
        "domain": "general",
        "urgency": "low",
    }
    did = (await client.post("/api/v1/decisions", json=payload)).json()["id"]
    assert (await client.delete(f"/api/v1/decisions/{did}")).status_code == 204
    assert (await client.get(f"/api/v1/decisions/{did}")).status_code == 404
