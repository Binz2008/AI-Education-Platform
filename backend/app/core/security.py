import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Any

from fastapi import HTTPException, status
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """Create access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def create_refresh_token(data: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """Create refresh token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm="HS256")
    return encoded_jwt


def verify_token(token: str, expected_type: str = "access") -> dict[str, Any]:
    """Verify and decode token."""
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
        token_type = payload.get("type")
        if token_type != expected_type:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        return payload
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")


def hash_prompt(prompt: str) -> str:
    """Hash prompt for audit logging."""
    return hashlib.sha256(prompt.encode()).hexdigest()


def generate_session_id() -> str:
    """Generate secure session ID."""
    return secrets.token_urlsafe(32)


# Content filtering functions
def is_age_appropriate(content: str, age_group: str) -> bool:
    """Check if content is appropriate for age group."""
    # Implement age-appropriate content filtering logic
    # This is a placeholder - implement actual filtering
    return True


def filter_profanity(content: str) -> tuple[str, bool]:
    """Filter profanity from content."""
    # Implement profanity filtering
    # Returns (filtered_content, had_profanity)
    return content, False


def validate_educational_content(content: str, subject: str) -> bool:
    """Validate that content is educational and on-topic."""
    # Implement educational content validation
    # This is a placeholder - implement actual validation
    return True


# Rate limiting helpers
async def check_rate_limit(redis_client, key: str, limit: int, window: int) -> bool:
    """Check if rate limit is exceeded."""
    current = await redis_client.get(key)
    if current is None:
        await redis_client.setex(key, window, 1)
        return True

    if int(current) >= limit:
        return False

    await redis_client.incr(key)
    return True
