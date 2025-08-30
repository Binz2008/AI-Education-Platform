"""Comprehensive monitoring middleware for the AI Education Platform.
Tracks request metrics, performance, errors, and system health.
"""

import json
import logging
import sys
import time
import uuid
from collections import defaultdict, deque
from datetime import UTC, datetime
from typing import Any

import psutil
import redis.asyncio as redis
from fastapi import Request, Response
from fastapi.responses import JSONResponse

from app.core.config import settings

logger = logging.getLogger(__name__)


class MetricsCollector:
    """Collects and stores application metrics."""

    def __init__(self):
        self.redis_client: redis.Redis | None = None
        self.metrics_buffer = defaultdict(list)
        self.request_times = deque(maxlen=1000)  # Keep last 1000 request times
        self.error_counts = defaultdict(int)
        self.endpoint_stats = defaultdict(lambda: {"count": 0, "total_time": 0, "errors": 0})

    async def init_redis(self):
        """Initialize Redis connection for metrics storage."""
        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=5,
                socket_keepalive=True,
                health_check_interval=30,
            )
            await self.redis_client.ping()
            logger.info("Monitoring Redis connection established")
        except Exception as e:
            logger.error(f"Failed to connect to Redis for monitoring: {e}")
            self.redis_client = None

    async def close_redis(self):
        """Close Redis connection."""
        if self.redis_client:
            await self.redis_client.close()

    async def record_request(self, request_data: dict[str, Any]):
        """Record request metrics."""
        endpoint = request_data.get("endpoint", "unknown")
        duration = request_data.get("duration", 0)
        status_code = request_data.get("status_code", 0)

        # Update in-memory stats
        self.request_times.append(duration)
        self.endpoint_stats[endpoint]["count"] += 1
        self.endpoint_stats[endpoint]["total_time"] += duration

        if status_code >= 400:
            self.endpoint_stats[endpoint]["errors"] += 1
            self.error_counts[f"{status_code}"] += 1

        # Store in Redis if available
        if self.redis_client:
            try:
                # Store individual request
                key = f"metrics:requests:{datetime.now().strftime('%Y-%m-%d:%H')}"
                await self.redis_client.lpush(key, json.dumps(request_data))
                await self.redis_client.expire(key, 86400)  # Keep for 24 hours

                # Update counters
                await self._update_redis_counters(request_data)

            except Exception as e:
                logger.error(f"Failed to store metrics in Redis: {e}")

    async def _update_redis_counters(self, request_data: dict[str, Any]):
        """Update Redis counters atomically."""
        if not self.redis_client:
            return

        try:
            pipe = self.redis_client.pipeline()
            timestamp = datetime.now().strftime("%Y-%m-%d:%H:%M")

            # Request count per minute
            pipe.incr(f"counter:requests:{timestamp}")
            pipe.expire(f"counter:requests:{timestamp}", 3600)

            # Endpoint specific counters
            endpoint = request_data.get("endpoint", "unknown")
            pipe.incr(f"counter:endpoint:{endpoint}:{timestamp}")
            pipe.expire(f"counter:endpoint:{endpoint}:{timestamp}", 3600)

            # Status code counters
            status_code = request_data.get("status_code", 0)
            pipe.incr(f"counter:status:{status_code}:{timestamp}")
            pipe.expire(f"counter:status:{status_code}:{timestamp}", 3600)

            # Response time histogram
            duration = request_data.get("duration", 0)
            bucket = self._get_duration_bucket(duration)
            pipe.incr(f"histogram:duration:{bucket}:{timestamp}")
            pipe.expire(f"histogram:duration:{bucket}:{timestamp}", 3600)

            await pipe.execute()

        except Exception as e:
            logger.error(f"Failed to update Redis counters: {e}")

    def _get_duration_bucket(self, duration: float) -> str:
        """Get duration bucket for histogram."""
        if duration < 0.1:
            return "0-100ms"
        elif duration < 0.5:
            return "100-500ms"
        elif duration < 1.0:
            return "500ms-1s"
        elif duration < 2.0:
            return "1-2s"
        elif duration < 5.0:
            return "2-5s"
        else:
            return "5s+"

    def get_current_stats(self) -> dict[str, Any]:
        """Get current in-memory statistics."""
        total_requests = sum(stats["count"] for stats in self.endpoint_stats.values())
        total_errors = sum(stats["errors"] for stats in self.endpoint_stats.values())

        avg_response_time = sum(self.request_times) / len(self.request_times) if self.request_times else 0

        return {
            "total_requests": total_requests,
            "total_errors": total_errors,
            "error_rate": total_errors / total_requests if total_requests > 0 else 0,
            "avg_response_time": avg_response_time,
            "requests_per_endpoint": dict(self.endpoint_stats),
            "error_counts": dict(self.error_counts),
            "system_info": self._get_system_info(),
        }

    def _get_system_info(self) -> dict[str, Any]:
        """Get current system information."""
        try:
            return {
                "cpu_percent": psutil.cpu_percent(),
                "memory_percent": psutil.virtual_memory().percent,
                "disk_percent": psutil.disk_usage("/").percent,
                "python_version": sys.version,
                "process_count": len(psutil.pids()),
            }
        except Exception as e:
            logger.error(f"Failed to get system info: {e}")
            return {}


class RequestTracker:
    """Tracks individual request lifecycle."""

    def __init__(self, request: Request):
        self.request = request
        self.start_time = time.time()
        self.request_id = str(uuid.uuid4())
        self.user_id = getattr(request.state, "user_id", None)

    def get_client_info(self) -> dict[str, Any]:
        """Extract client information from request."""
        forwarded_for = self.request.headers.get("X-Forwarded-For")
        client_ip = (
            forwarded_for.split(",")[0].strip()
            if forwarded_for
            else (self.request.client.host if self.request.client else "unknown")
        )

        return {
            "ip": client_ip,
            "user_agent": self.request.headers.get("User-Agent", "unknown"),
            "referer": self.request.headers.get("Referer"),
            "user_id": self.user_id,
        }

    async def create_request_data(self, response: Response) -> dict[str, Any]:
        """Create comprehensive request data."""
        duration = time.time() - self.start_time

        # Get request body size (if available)
        content_length = self.request.headers.get("Content-Length", "0")
        try:
            request_size = int(content_length)
        except (ValueError, TypeError):
            request_size = 0

        # Get response size
        response_size = len(response.body) if hasattr(response, "body") else 0

        return {
            "request_id": self.request_id,
            "timestamp": datetime.now(UTC).isoformat(),
            "method": self.request.method,
            "endpoint": self.request.url.path,
            "query_params": dict(self.request.query_params),
            "status_code": response.status_code,
            "duration": duration,
            "request_size": request_size,
            "response_size": response_size,
            "client_info": self.get_client_info(),
            "headers": dict(self.request.headers),
        }


# Global metrics collector
metrics_collector = MetricsCollector()


async def monitoring_middleware(request: Request, call_next):
    """FastAPI middleware for comprehensive monitoring."""
    # Skip monitoring for health checks and static files
    if request.url.path in ["/health", "/favicon.ico"] or request.url.path.startswith("/static"):
        return await call_next(request)

    # Create request tracker
    tracker = RequestTracker(request)

    # Add request ID to request state
    request.state.request_id = tracker.request_id

    # Log request start
    logger.info(
        f"Request started: {tracker.request_id} "
        f"{request.method} {request.url.path} "
        f"from {tracker.get_client_info()['ip']}"
    )

    try:
        # Process request
        response = await call_next(request)

        # Create request data
        request_data = await tracker.create_request_data(response)

        # Record metrics
        await metrics_collector.record_request(request_data)

        # Add monitoring headers
        response.headers["X-Request-ID"] = tracker.request_id
        response.headers["X-Response-Time"] = f"{request_data['duration']:.3f}s"

        # Log request completion
        logger.info(
            f"Request completed: {tracker.request_id} {response.status_code} in {request_data['duration']:.3f}s"
        )

        return response

    except Exception as e:
        # Handle errors
        duration = time.time() - tracker.start_time

        # Create error response
        error_response = JSONResponse(
            status_code=500,
            content={
                "error": "Internal server error",
                "request_id": tracker.request_id,
                "timestamp": datetime.now(UTC).isoformat(),
            },
        )

        # Record error metrics
        error_data = {
            "request_id": tracker.request_id,
            "timestamp": datetime.now(UTC).isoformat(),
            "method": request.method,
            "endpoint": request.url.path,
            "status_code": 500,
            "duration": duration,
            "error": str(e),
            "client_info": tracker.get_client_info(),
        }

        await metrics_collector.record_request(error_data)

        # Log error
        logger.error(f"Request failed: {tracker.request_id} {request.method} {request.url.path} Error: {str(e)}")

        return error_response


class HealthChecker:
    """System health monitoring."""

    @staticmethod
    async def check_database_health() -> dict[str, Any]:
        """Check database connectivity and performance."""
        try:
            from app.core.database import get_db_session

            start_time = time.time()
            async with get_db_session() as session:
                # Simple query to test connectivity
                result = await session.execute("SELECT 1")
                await result.fetchone()

            duration = time.time() - start_time

            return {"status": "healthy", "response_time": duration, "timestamp": datetime.now(UTC).isoformat()}

        except Exception as e:
            return {"status": "unhealthy", "error": str(e), "timestamp": datetime.now(UTC).isoformat()}

    @staticmethod
    async def check_redis_health() -> dict[str, Any]:
        """Check Redis connectivity and performance."""
        try:
            if not metrics_collector.redis_client:
                await metrics_collector.init_redis()

            if metrics_collector.redis_client:
                start_time = time.time()
                await metrics_collector.redis_client.ping()
                duration = time.time() - start_time

                return {"status": "healthy", "response_time": duration, "timestamp": datetime.now(UTC).isoformat()}
            else:
                return {
                    "status": "unavailable",
                    "error": "Redis client not initialized",
                    "timestamp": datetime.now(UTC).isoformat(),
                }

        except Exception as e:
            return {"status": "unhealthy", "error": str(e), "timestamp": datetime.now(UTC).isoformat()}

    @staticmethod
    def check_system_resources() -> dict[str, Any]:
        """Check system resource usage."""
        try:
            cpu_percent = psutil.cpu_percent(interval=1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage("/")

            # Determine overall health based on thresholds
            health_status = "healthy"
            if cpu_percent > 80 or memory.percent > 85 or disk.percent > 90:
                health_status = "warning"
            if cpu_percent > 95 or memory.percent > 95 or disk.percent > 95:
                health_status = "critical"

            return {
                "status": health_status,
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_available_gb": memory.available / (1024**3),
                "disk_percent": disk.percent,
                "disk_free_gb": disk.free / (1024**3),
                "timestamp": datetime.now(UTC).isoformat(),
            }

        except Exception as e:
            return {"status": "error", "error": str(e), "timestamp": datetime.now(UTC).isoformat()}


# Health checker instance
health_checker = HealthChecker()
