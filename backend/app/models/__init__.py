"""Export all models for Alembic autogeneration and repository access."""

from app.models.base import GUID, Base, BaseModel
from app.models.profile import CandidateProfile
from app.models.user import User

__all__ = [
    "GUID",
    "Base",
    "BaseModel",
    "CandidateProfile",
    "User",
]
