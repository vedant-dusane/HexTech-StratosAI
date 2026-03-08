"""Structured JSON logging — pretty console in dev, JSON in prod."""
import logging
import sys

import structlog

from app.core.config import settings


def setup_logging() -> None:
    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="ISO"),
        structlog.processors.StackInfoRenderer(),
        structlog.dev.set_exc_info,
    ]
    if settings.is_production:
        processors.append(structlog.processors.JSONRenderer())
    else:
        processors.append(structlog.dev.ConsoleRenderer(colors=True))

    structlog.configure(
        processors=processors,
        wrapper_class=structlog.make_filtering_bound_logger(
            logging.DEBUG if settings.DEBUG else logging.INFO
        ),
        logger_factory=structlog.PrintLoggerFactory(file=sys.stdout),
        cache_logger_on_first_use=True,
    )
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def get_logger(name: str = __name__) -> structlog.BoundLogger:
    return structlog.get_logger(name)
