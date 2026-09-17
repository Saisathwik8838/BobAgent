"""Export all models for Alembic autogeneration and repository access."""

from app.models.application import Application, ApplicationEvent, ApplicationStatus
from app.models.base import GUID, Base, BaseModel
from app.models.document import Document, DocumentChunk
from app.models.job import Job
from app.models.profile import CandidateProfile
from app.models.resume import Resume, ResumeVersion
from app.models.user import User

__all__ = [
    "Application",
    "ApplicationEvent",
    "ApplicationStatus",
    "GUID",
    "Base",
    "BaseModel",
    "CandidateProfile",
    "Document",
    "DocumentChunk",
    "Job",
    "Resume",
    "ResumeVersion",
    "User",
]
