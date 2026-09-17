"""Authentication service handling registration and login."""


from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.profile import CandidateProfile
from app.models.user import User
from app.repositories.profile import CandidateProfileRepository
from app.repositories.user import UserRepository
from app.schemas.user import Token, UserCreate, UserLogin, UserResponse


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.profile_repo = CandidateProfileRepository(db)

    async def register(self, user_in: UserCreate) -> tuple[Token, User]:
        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists.",
            )

        new_user = User(
            email=user_in.email,
            password_hash=get_password_hash(user_in.password),
            full_name=user_in.full_name,
            is_active=True,
            is_verified=False,
        )
        created_user = await self.user_repo.create(new_user)

        # Create default candidate profile
        profile = CandidateProfile(
            user_id=created_user.id,
            headline=f"Professional Profile for {created_user.full_name}",
            summary="",
            metadata_json={},
        )
        await self.profile_repo.create(profile)

        access_token = create_access_token(subject=created_user.id)
        token_data = Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(created_user),
        )
        return token_data, created_user

    async def authenticate(self, login_in: UserLogin) -> tuple[Token, User]:
        user = await self.user_repo.get_by_email(login_in.email)
        if not user or not verify_password(login_in.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user account.",
            )

        access_token = create_access_token(subject=user.id)
        token_data = Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )
        return token_data, user
