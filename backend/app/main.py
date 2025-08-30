"""AI Education Platform API - Main application module.

FastAPI application with rate limiting, monitoring, and comprehensive middleware.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.core.database import init_db
from app.middleware.monitoring import metrics_collector, monitoring_middleware
from app.middleware.rate_limiting import rate_limit_middleware, rate_limiter


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown tasks."""
    # Startup
    await init_db()
    await rate_limiter.init_redis()
    await metrics_collector.init_redis()
    yield
    # Shutdown - cleanup if needed
    await rate_limiter.close_redis()
    await metrics_collector.close_redis()


app = FastAPI(
    title="AI Education Platform API",
    description="Backend API for AI-powered educational platform for children",
    version="1.0.0",
    openapi_url=f"{settings.API_PREFIX}/openapi.json",
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc",
    lifespan=lifespan,
)

# Add monitoring middleware first (outermost)
app.middleware("http")(monitoring_middleware)

# Add rate limiting middleware
app.middleware("http")(rate_limit_middleware)

# Security middleware
app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router with prefix
app.include_router(api_router, prefix=settings.API_PREFIX)


# Root health check (outside API prefix for load balancers)
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai-education-api"}


@app.get("/")
async def root():
    return {"message": "AI Education Platform API", "version": "1.0.0", "docs": f"{settings.API_PREFIX}/docs"}
