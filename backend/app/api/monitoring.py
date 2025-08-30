"""Monitoring and metrics API endpoints for the AI Education Platform.
Provides system health, performance metrics, and monitoring dashboard data.
"""

from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.middleware.monitoring import health_checker, metrics_collector

router = APIRouter()


@router.get("/health")
async def get_system_health():
    """Get comprehensive system health status."""
    try:
        # Check all system components
        db_health = await health_checker.check_database_health()
        redis_health = await health_checker.check_redis_health()
        system_resources = health_checker.check_system_resources()

        # Determine overall health
        overall_status = "healthy"
        if (
            db_health["status"] != "healthy"
            or redis_health["status"] not in ["healthy", "unavailable"]
            or system_resources["status"] in ["warning", "critical"]
        ):
            overall_status = "degraded"

        if db_health["status"] == "unhealthy" or system_resources["status"] == "critical":
            overall_status = "unhealthy"

        return {
            "status": overall_status,
            "timestamp": datetime.now(UTC).isoformat(),
            "components": {"database": db_health, "redis": redis_health, "system": system_resources},
            "version": settings.VERSION,
            "environment": "production" if not settings.DEBUG else "development",
        }

    except Exception as e:
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"status": "error", "error": str(e), "timestamp": datetime.now(UTC).isoformat()},
        )


@router.get("/metrics")
async def get_system_metrics():
    """Get current system performance metrics."""
    try:
        stats = metrics_collector.get_current_stats()

        return {"timestamp": datetime.now(UTC).isoformat(), "metrics": stats, "collection_period": "real-time"}

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve metrics: {str(e)}"
        )


@router.get("/metrics/requests")
async def get_request_metrics():
    """Get detailed request metrics and statistics."""
    try:
        stats = metrics_collector.get_current_stats()

        return {
            "timestamp": datetime.now(UTC).isoformat(),
            "total_requests": stats.get("total_requests", 0),
            "total_errors": stats.get("total_errors", 0),
            "error_rate": stats.get("error_rate", 0),
            "average_response_time": stats.get("avg_response_time", 0),
            "endpoints": stats.get("requests_per_endpoint", {}),
            "error_breakdown": stats.get("error_counts", {}),
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve request metrics: {str(e)}"
        )


@router.get("/metrics/system")
async def get_system_resource_metrics():
    """Get system resource usage metrics."""
    try:
        system_info = health_checker.check_system_resources()

        return {
            "timestamp": datetime.now(UTC).isoformat(),
            "cpu_percent": system_info.get("cpu_percent", 0),
            "memory_percent": system_info.get("memory_percent", 0),
            "memory_available_gb": system_info.get("memory_available_gb", 0),
            "disk_percent": system_info.get("disk_percent", 0),
            "disk_free_gb": system_info.get("disk_free_gb", 0),
            "status": system_info.get("status", "unknown"),
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve system metrics: {str(e)}"
        )


@router.get("/dashboard")
async def get_monitoring_dashboard():
    """Get comprehensive monitoring dashboard data."""
    try:
        # Get all monitoring data
        health_data = await get_system_health()
        metrics_data = await get_system_metrics()
        request_data = await get_request_metrics()
        system_data = await get_system_resource_metrics()

        return {
            "timestamp": datetime.now(UTC).isoformat(),
            "dashboard": {
                "health": health_data,
                "performance": {"requests": request_data, "system": system_data},
                "metrics": metrics_data["metrics"],
                "alerts": _generate_alerts(health_data, system_data, request_data),
            },
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to generate dashboard data: {str(e)}"
        )


def _generate_alerts(health_data: dict, system_data: dict, request_data: dict) -> list[dict[str, Any]]:
    """Generate alerts based on system metrics."""
    alerts = []

    # System resource alerts
    if system_data.get("cpu_percent", 0) > 80:
        alerts.append(
            {
                "type": "warning" if system_data["cpu_percent"] < 95 else "critical",
                "component": "system",
                "message": f"High CPU usage: {system_data['cpu_percent']:.1f}%",
                "timestamp": datetime.now(UTC).isoformat(),
            }
        )

    if system_data.get("memory_percent", 0) > 85:
        alerts.append(
            {
                "type": "warning" if system_data["memory_percent"] < 95 else "critical",
                "component": "system",
                "message": f"High memory usage: {system_data['memory_percent']:.1f}%",
                "timestamp": datetime.now(UTC).isoformat(),
            }
        )

    if system_data.get("disk_percent", 0) > 90:
        alerts.append(
            {
                "type": "warning" if system_data["disk_percent"] < 95 else "critical",
                "component": "system",
                "message": f"High disk usage: {system_data['disk_percent']:.1f}%",
                "timestamp": datetime.now(UTC).isoformat(),
            }
        )

    # Error rate alerts
    error_rate = request_data.get("error_rate", 0)
    if error_rate > 0.05:  # 5% error rate
        alerts.append(
            {
                "type": "warning" if error_rate < 0.1 else "critical",
                "component": "application",
                "message": f"High error rate: {error_rate:.2%}",
                "timestamp": datetime.now(UTC).isoformat(),
            }
        )

    # Response time alerts
    avg_response_time = request_data.get("average_response_time", 0)
    if avg_response_time > 2.0:  # 2 seconds
        alerts.append(
            {
                "type": "warning" if avg_response_time < 5.0 else "critical",
                "component": "performance",
                "message": f"Slow response time: {avg_response_time:.2f}s",
                "timestamp": datetime.now(UTC).isoformat(),
            }
        )

    # Health status alerts
    if health_data.get("status") != "healthy":
        alerts.append(
            {
                "type": "critical" if health_data["status"] == "unhealthy" else "warning",
                "component": "health",
                "message": f"System health: {health_data['status']}",
                "timestamp": datetime.now(UTC).isoformat(),
            }
        )

    return alerts


@router.get("/status")
async def get_service_status():
    """Get simple service status for load balancers."""
    try:
        db_health = await health_checker.check_database_health()

        if db_health["status"] == "healthy":
            return {"status": "ok"}
        else:
            return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content={"status": "unavailable"})

    except Exception:
        return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content={"status": "error"})
