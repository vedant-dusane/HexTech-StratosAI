"""FastAPI application factory — wires middleware, routers, and lifecycle hooks."""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.decisions import router as decisions_router
from app.core.config import settings
from app.core.database import create_tables
from app.core.logging import get_logger, setup_logging

log = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    log.info("startup", app=settings.APP_NAME, env=settings.APP_ENV)
    if not settings.is_production:
        await create_tables()
        log.info("db_tables_ready")
    yield
    log.info("shutdown")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        description="Business Decision Intelligence — 6 AI agents, one verdict.",
        version=settings.APP_VERSION,
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    # GZipMiddleware removed — it buffers StreamingResponse and kills SSE
    app.include_router(decisions_router, prefix="/api/v1")

    @app.get("/health", tags=["system"])
    async def health():
        return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}

    return app


app = create_app()