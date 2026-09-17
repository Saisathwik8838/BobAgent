"""Create resumes, resume_versions, and jobs tables

Revision ID: 0003_resumes_jobs
Revises: 0002_create_rag_docs
Create Date: 2026-09-17 22:35:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0003_resumes_jobs"
down_revision: Union[str, None] = "0002_create_rag_docs"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Resumes
    op.create_table(
        "resumes",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("candidate_id", sa.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("file_name", sa.String(length=255), nullable=True),
        sa.Column("raw_text", sa.Text(), nullable=False),
        sa.Column("parsed_json", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_resumes_candidate_id", "resumes", ["candidate_id"])

    # 2. Resume Versions
    op.create_table(
        "resume_versions",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("resume_id", sa.UUID(as_uuid=True), sa.ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("job_id", sa.UUID(as_uuid=True), nullable=True),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("target_role", sa.String(length=255), nullable=False, server_default="Tailored Role"),
        sa.Column("tailored_content_json", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("diff_summary", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_resume_versions_resume_id", "resume_versions", ["resume_id"])
    op.create_index("ix_resume_versions_job_id", "resume_versions", ["job_id"])

    # 3. Jobs
    op.create_table(
        "jobs",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column("candidate_id", sa.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("company", sa.String(length=255), nullable=False),
        sa.Column("url", sa.String(length=500), nullable=True),
        sa.Column("raw_description", sa.Text(), nullable=False),
        sa.Column("seniority", sa.String(length=50), nullable=False, server_default="Mid-Senior"),
        sa.Column("location", sa.String(length=255), nullable=True),
        sa.Column("salary_range", sa.String(length=100), nullable=True),
        sa.Column("mandatory_skills", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
        sa.Column("preferred_skills", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
        sa.Column("responsibilities", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
        sa.Column("parsed_requirements_json", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_jobs_candidate_id", "jobs", ["candidate_id"])


def downgrade() -> None:
    op.drop_index("ix_jobs_candidate_id", table_name="jobs")
    op.drop_table("jobs")
    op.drop_index("ix_resume_versions_job_id", table_name="resume_versions")
    op.drop_index("ix_resume_versions_resume_id", table_name="resume_versions")
    op.drop_table("resume_versions")
    op.drop_index("ix_resumes_candidate_id", table_name="resumes")
    op.drop_table("resumes")
