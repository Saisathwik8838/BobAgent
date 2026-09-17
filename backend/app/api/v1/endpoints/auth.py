"""Authentication endpoints: register, login, me."""

from typing import Any

from fastapi import APIRouter, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_active_user, get_db
from app.models.user import User
from app.schemas.user import Token, UserCreate, UserLogin, UserResponse
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Register new user account and receive JWT access token."""
    auth_service = AuthService(db)
    token, _ = await auth_service.register(user_in)
    return token


@router.post("/login", response_model=Token)
async def login_json(
    login_in: UserLogin,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Authenticate user with JSON credentials."""
    auth_service = AuthService(db)
    token, _ = await auth_service.authenticate(login_in)
    return token


@router.post("/token", response_model=Token)
async def login_form(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
) -> Any:
    """Authenticate user with OAuth2 form data (for OpenAPI docs)."""
    auth_service = AuthService(db)
    login_in = UserLogin(email=form_data.username, password=form_data.password)
    token, _ = await auth_service.authenticate(login_in)
    return token


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_active_user),
) -> Any:
    """Return currently authenticated user profile."""
    return UserResponse.model_validate(current_user)
