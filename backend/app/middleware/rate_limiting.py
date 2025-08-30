"""Rate limiting middleware using Redis backend for the AI Education Platform.
Implements sliding window rate limiting with different limits for different endpoint types.
"""

import logging
import time
from typing import Any

import redis.asyncio as redis
from fastapi import Request, status
from fastapi.responses import JSONResponse

from app.core.config import settings

logger = logging.getLogger(__name__)


class RateLimitConfig:
    """Configuration for different rate limiting rules."""

    # Default limits (requests per window)
    DEFAULT_LIMITS = {"per_minute": 60, "per_hour": 1000, "per_day": 10000}

    # Endpoint-specific limits
    ENDPOINT_LIMITS = {
        # Authentication endpoints - stricter limits
        "/auth/login": {"per_minute": 5, "per_hour": 20, "per_day": 100},
        "/auth/register": {"per_minute": 3, "per_hour": 10, "per_day": 50},
        "/auth/refresh": {"per_minute": 10, "per_hour": 50, "per_day": 200},
        # Chat endpoints - moderate limits
        "/chat/send": {"per_minute": 30, "per_hour": 500, "per_day": 2000},
        "/chat/voice": {"per_minute": 10, "per_hour": 100, "per_day": 500},
        # File upload endpoints - strict limits
        "/upload": {"per_minute": 5, "per_hour": 50, "per_day": 200},
        # Dashboard/analytics - lenient limits
        "/dashboard": {"per_minute": 100, "per_hour": 1000, "per_day": 5000},
        "/analytics": {"per_minute": 50, "per_hour": 500, "per_day": 2000},
        # Child management - moderate limits
        "/children": {"per_minute": 20, "per_hour": 200, "per_day": 1000},
        "/sessions": {"per_minute": 30, "per_hour": 300, "per_day": 1500},
    }

    # Time windows in seconds
    WINDOWS = {"per_minute": 60, "per_hour": 3600, "per_day": 86400}


class RateLimiter:
    """Redis-based rate limiter with sliding window algorithm."""

    def __init__(self):
        self.redis_client: redis.Redis | None = None
        self.config = RateLimitConfig()

    async def init_redis(self):
        """Initialize Redis connection."""
        try:
            self.redis_client = redis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=5,
                socket_keepalive=True,
                health_check_interval=30,
            )
            # Test connection
            await self.redis_client.ping()
            logger.info("Rate limiter Redis connection established")
        except Exception as e:
            logger.error(f"Failed to connect to Redis for rate limiting: {e}")
            self.redis_client = None

    async def close_redis(self):
        """Close Redis connection."""
        if self.redis_client:
            await self.redis_client.close()

    def _get_client_identifier(self, request: Request) -> str:
        """Get unique client identifier for rate limiting."""
        # Try to get user ID from JWT token first
        user_id = getattr(request.state, "user_id", None)
        if user_id:
            return f"user:{user_id}"

        # Fallback to IP address
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "unknown"

        return f"ip:{client_ip}"

    def _get_endpoint_pattern(self, path: str) -> str:
        """Match request path to rate limit pattern."""
        # Remove API prefix
        if path.startswith(settings.API_PREFIX):
            path = path[len(settings.API_PREFIX) :]

        # Check for exact matches first
        if path in self.config.ENDPOINT_LIMITS:
            return path

        # Check for pattern matches
        for pattern in self.config.ENDPOINT_LIMITS:
            if path.startswith(pattern):
                return pattern

        return "default"

    def _get_limits_for_endpoint(self, endpoint_pattern: str) -> dict[str, int]:
        """Get rate limits for specific endpoint."""
        if endpoint_pattern in self.config.ENDPOINT_LIMITS:
            return self.config.ENDPOINT_LIMITS[endpoint_pattern]
        return self.config.DEFAULT_LIMITS

    async def _check_rate_limit(self, key: str, limit: int, window: int) -> tuple[bool, dict[str, Any]]:
        """Check if request is within rate limit using sliding window."""
        if not self.redis_client:
            # If Redis is not available, allow the request
            return True, {"remaining": limit, "reset_time": int(time.time()) + window}

        try:
            current_time = time.time()
            window_start = current_time - window

            # Use Redis pipeline for atomic operations
            pipe = self.redis_client.pipeline()

            # Remove old entries outside the window
            pipe.zremrangebyscore(key, 0, window_start)

            # Count current requests in window
            pipe.zcard(key)

            # Add current request
            pipe.zadd(key, {str(current_time): current_time})

            # Set expiration
            pipe.expire(key, window)

            results = await pipe.execute()
            current_count = results[1] + 1  # +1 for the current request

            remaining = max(0, limit - current_count)
            reset_time = int(current_time + window)

            is_allowed = current_count <= limit

            return is_allowed, {
                "remaining": remaining,
                "reset_time": reset_time,
                "current_count": current_count,
                "limit": limit,
            }

        except Exception as e:
            logger.error(f"Rate limit check failed: {e}")
            # On Redis error, allow the request
            return True, {"remaining": limit, "reset_time": int(time.time()) + window}

    async def check_request(self, request: Request) -> JSONResponse | None:
        """Check if request should be rate limited."""
        client_id = self._get_client_identifier(request)
        endpoint_pattern = self._get_endpoint_pattern(request.url.path)
        limits = self._get_limits_for_endpoint(endpoint_pattern)

        # Check each time window
        for window_name, limit in limits.items():
            window_seconds = self.config.WINDOWS[window_name]
            key = f"rate_limit:{client_id}:{endpoint_pattern}:{window_name}"

            is_allowed, info = await self._check_rate_limit(key, limit, window_seconds)

            if not is_allowed:
                # Rate limit exceeded
                logger.warning(
                    f"Rate limit exceeded for {client_id} on {endpoint_pattern} "
                    f"({window_name}: {info['current_count']}/{limit})"
                )

                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={
                        "error": "Rate limit exceeded",
                        "message": f"Too many requests. Limit: {limit} per {window_name.replace('per_', '')}",
                        "retry_after": info["reset_time"] - int(time.time()),
                        "limit": limit,
                        "remaining": 0,
                        "reset_time": info["reset_time"],
                    },
                    headers={
                        "X-RateLimit-Limit": str(limit),
                        "X-RateLimit-Remaining": "0",
                        "X-RateLimit-Reset": str(info["reset_time"]),
                        "Retry-After": str(info["reset_time"] - int(time.time())),
                    },
                )

        # Add rate limit headers to successful responses
        # Get the most restrictive window for headers
        minute_limit = limits.get("per_minute", self.config.DEFAULT_LIMITS["per_minute"])
        minute_key = f"rate_limit:{client_id}:{endpoint_pattern}:per_minute"
        _, minute_info = await self._check_rate_limit(minute_key, minute_limit, 60)

        # Store rate limit info in request state for response headers
        request.state.rate_limit_info = {
            "limit": minute_limit,
            "remaining": minute_info["remaining"],
            "reset_time": minute_info["reset_time"],
        }

        return None  # Allow request


# Global rate limiter instance
rate_limiter = RateLimiter()


async def rate_limit_middleware(request: Request, call_next):
    """FastAPI middleware for rate limiting."""
    # Skip rate limiting for health checks and static files
    if request.url.path in ["/health", "/", "/favicon.ico"] or request.url.path.startswith("/static"):
        response = await call_next(request)
        return response

    # Check rate limit
    rate_limit_response = await rate_limiter.check_request(request)
    if rate_limit_response:
        return rate_limit_response

    # Process request
    response = await call_next(request)

    # Add rate limit headers to response
    if hasattr(request.state, "rate_limit_info"):
        info = request.state.rate_limit_info
        response.headers["X-RateLimit-Limit"] = str(info["limit"])
        response.headers["X-RateLimit-Remaining"] = str(info["remaining"])
        response.headers["X-RateLimit-Reset"] = str(info["reset_time"])

    return response
