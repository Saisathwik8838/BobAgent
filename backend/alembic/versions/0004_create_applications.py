"""Create applications and application_events tables

Revision ID: 0004_applications
Revises: 0003_resumes_jobs
Create Date: 2026-09-17 22:45:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0004_applications"
down_revision: str | None = "0003_resumes_jobs"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "applications",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "candidate_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "job_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("jobs.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "resume_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("resumes.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="saved"),
        sa.Column("applied_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("notes", sa.Text(), nullable=False, server_default=""),
        sa.Column("salary_offered", sa.String(length=100), nullable=True),
        sa.Column("contact_name", sa.String(length=255), nullable=True),
        sa.Column("contact_email", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_applications_candidate_id", "applications", ["candidate_id"])
    op.create_index("ix_applications_job_id", "applications", ["job_id"])
    op.create_index("ix_applications_status", "applications", ["status"])

    op.create_table(
        "application_events",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "application_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("applications.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("event_type", sa.String(length=50), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=False),
        sa.Column("metadata_json", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_application_events_application_id", "application_events", ["application_id"])


def downgrade() -> None:
    op.drop_table("application_events")
    op.drop_table("applications")
