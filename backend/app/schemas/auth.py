from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    confirmPassword: str
    firstName: str
    lastName: str
    termsAccepted: bool = True

    def model_validate(self, values):
        if values.get("password") != values.get("confirmPassword"):
            raise ValueError("Passwords do not match")
        return values


class TokenResponse(BaseModel):
    accessToken: str
    refreshToken: str
    expiresIn: int


class RefreshTokenRequest(BaseModel):
    refreshToken: str
