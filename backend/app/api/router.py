from fastapi import APIRouter

from . import monitoring
from .routes import agents, assessments, auth, children, dashboard, lessons, sessions

# Create main API router
api_router = APIRouter()

# Include route modules
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(children.router, prefix="/children", tags=["children"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["sessions"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(lessons.router, prefix="/lessons", tags=["lessons"])
api_router.include_router(assessments.router, prefix="/assessments", tags=["assessments"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(monitoring.router, prefix="/monitoring", tags=["monitoring"])


@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Education Platform API"}
