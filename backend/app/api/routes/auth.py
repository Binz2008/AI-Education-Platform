from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlmodel import Session, select

from app.core.database import get_db_session
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    verify_token,
)
from app.models.guardian import Guardian
from app.schemas.auth import LoginRequest, RefreshTokenRequest, RegisterRequest, TokenResponse

router = APIRouter()
security = HTTPBearer()


@router.post("/register", response_model=TokenResponse)
async def register(user_data: RegisterRequest, session: Session = Depends(get_db_session)):
    """Register a new guardian account."""
    # Check if email already exists
    existing_user = session.exec(select(Guardian).where(Guardian.email == user_data.email)).first()

    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    # Create new guardian
    guardian = Guardian(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        first_name=user_data.firstName,
        last_name=user_data.lastName,
    )

    session.add(guardian)
    session.commit()
    session.refresh(guardian)

    # Generate tokens
    access_token = create_access_token({"sub": str(guardian.id), "type": "guardian"})
    refresh_token = create_refresh_token({"sub": str(guardian.id), "type": "guardian"})

    return TokenResponse(
        accessToken=access_token,
        refreshToken=refresh_token,
        expiresIn=1800,  # 30 minutes
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, session: Session = Depends(get_db_session)):
    """Login guardian."""
    # Find guardian by email
    guardian = session.exec(select(Guardian).where(Guardian.email == credentials.email)).first()

    if not guardian or not verify_password(credentials.password, guardian.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    if not guardian.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account is disabled")

    # Generate tokens
    access_token = create_access_token({"sub": str(guardian.id), "type": "guardian"})
    refresh_token = create_refresh_token({"sub": str(guardian.id), "type": "guardian"})

    return TokenResponse(
        accessToken=access_token,
        refreshToken=refresh_token,
        expiresIn=1800,  # 30 minutes
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_data: RefreshTokenRequest, session: Session = Depends(get_db_session)):
    """Refresh access token."""
    try:
        payload = verify_token(refresh_data.refreshToken, "refresh")
        guardian_id = payload.get("sub")

        # Verify guardian still exists and is active
        guardian = session.get(Guardian, guardian_id)
        if not guardian or not guardian.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        # Generate new tokens
        access_token = create_access_token({"sub": guardian_id, "type": "guardian"})
        new_refresh_token = create_refresh_token({"sub": guardian_id, "type": "guardian"})

        return TokenResponse(accessToken=access_token, refreshToken=new_refresh_token, expiresIn=1800)

    except HTTPException:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")


@router.get("/me")
async def get_current_guardian(token: str = Depends(security), session: Session = Depends(get_db_session)):
    """Get current guardian profile."""
    payload = verify_token(token.credentials)
    guardian_id = payload.get("sub")

    guardian = session.get(Guardian, guardian_id)
    if not guardian:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guardian not found")

    return {
        "id": guardian.id,
        "email": guardian.email,
        "firstName": guardian.first_name,
        "lastName": guardian.last_name,
        "preferredLanguage": guardian.preferred_language,
        "isEmailVerified": guardian.is_email_verified,
    }


@router.post("/logout")
async def logout():
    """Logout guardian (client-side token removal)."""
    return {"message": "Successfully logged out"}
