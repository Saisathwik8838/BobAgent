"""Create agent_runs, interview_sessions, interview_questions, interview_answers, and evaluation_results tables

Revision ID: 0005_agents_interview_eval
Revises: 0004_applications
Create Date: 2026-09-18 20:10:00.000000

"""
from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0005_agents_interview_eval"
down_revision: str | None = "0004_applications"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # 1. agent_runs
    op.create_table(
        "agent_runs",
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
            sa.ForeignKey("jobs.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("agent_type", sa.String(length=50), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="completed"),
        sa.Column("summary", sa.Text(), nullable=False, server_default=""),
        sa.Column("inputs_json", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("outputs_json", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("traces_json", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
        sa.Column("groundedness_score", sa.Float(), nullable=False, server_default="1.0"),
        sa.Column("citations_json", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_agent_runs_candidate_id", "agent_runs", ["candidate_id"])
    op.create_index("ix_agent_runs_job_id", "agent_runs", ["job_id"])
    op.create_index("ix_agent_runs_agent_type", "agent_runs", ["agent_type"])

    # 2. interview_sessions
    op.create_table(
        "interview_sessions",
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
            sa.ForeignKey("jobs.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column("role_title", sa.String(length=255), nullable=False),
        sa.Column("difficulty", sa.String(length=50), nullable=False, server_default="Senior"),
        sa.Column("status", sa.String(length=50), nullable=False, server_default="active"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_interview_sessions_candidate_id", "interview_sessions", ["candidate_id"])
    op.create_index("ix_interview_sessions_job_id", "interview_sessions", ["job_id"])

    # 3. interview_questions
    op.create_table(
        "interview_questions",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "session_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("interview_sessions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("question_text", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("expected_points", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
        sa.Column("order_idx", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_interview_questions_session_id", "interview_questions", ["session_id"])

    # 4. interview_answers
    op.create_table(
        "interview_answers",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "session_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("interview_sessions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "question_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("interview_questions.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "candidate_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("answer_text", sa.Text(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("correctness", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("clarity", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("depth", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("feedback", sa.Text(), nullable=False, server_default=""),
        sa.Column("missing_concepts", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
        sa.Column("grounded_suggestion", sa.Text(), nullable=False, server_default=""),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_interview_answers_session_id", "interview_answers", ["session_id"])
    op.create_index("ix_interview_answers_question_id", "interview_answers", ["question_id"])
    op.create_index("ix_interview_answers_candidate_id", "interview_answers", ["candidate_id"])

    # 5. evaluation_results
    op.create_table(
        "evaluation_results",
        sa.Column("id", sa.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column(
            "candidate_id",
            sa.UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("target_type", sa.String(length=50), nullable=False),
        sa.Column("target_id", sa.String(length=255), nullable=True),
        sa.Column("metric_name", sa.String(length=100), nullable=False),
        sa.Column("score", sa.Float(), nullable=False),
        sa.Column("details_json", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
        sa.Column("passed", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_evaluation_results_candidate_id", "evaluation_results", ["candidate_id"])
    op.create_index("ix_evaluation_results_target_type", "evaluation_results", ["target_type"])
    op.create_index("ix_evaluation_results_metric_name", "evaluation_results", ["metric_name"])


def downgrade() -> None:
    op.drop_index("ix_evaluation_results_metric_name", table_name="evaluation_results")
    op.drop_index("ix_evaluation_results_target_type", table_name="evaluation_results")
    op.drop_index("ix_evaluation_results_candidate_id", table_name="evaluation_results")
    op.drop_table("evaluation_results")

    op.drop_index("ix_interview_answers_candidate_id", table_name="interview_answers")
    op.drop_index("ix_interview_answers_question_id", table_name="interview_answers")
    op.drop_index("ix_interview_answers_session_id", table_name="interview_answers")
    op.drop_table("interview_answers")

    op.drop_index("ix_interview_questions_session_id", table_name="interview_questions")
    op.drop_table("interview_questions")

    op.drop_index("ix_interview_sessions_job_id", table_name="interview_sessions")
    op.drop_index("ix_interview_sessions_candidate_id", table_name="interview_sessions")
    op.drop_table("interview_sessions")

    op.drop_index("ix_agent_runs_agent_type", table_name="agent_runs")
    op.drop_index("ix_agent_runs_job_id", table_name="agent_runs")
    op.drop_index("ix_agent_runs_candidate_id", table_name="agent_runs")
    op.drop_table("agent_runs")
