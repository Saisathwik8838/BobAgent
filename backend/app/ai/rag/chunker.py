"""Document chunking strategies tailored to source types (resume, job, custom_doc)."""

import re
from typing import Any


class DocumentChunker:
    @staticmethod
    def chunk_document(
        content: str, document_type: str = "custom_doc", max_chars: int = 600, overlap_chars: int = 100
    ) -> list[dict[str, Any]]:
        """Splits document content into typed semantic chunks based on document type."""
        clean_content = content.strip()
        if not clean_content:
            return []

        if document_type == "resume":
            return DocumentChunker._chunk_resume(clean_content)
        elif document_type == "job":
            return DocumentChunker._chunk_job_description(clean_content)
        else:
            return DocumentChunker._chunk_generic(clean_content, max_chars, overlap_chars)

    @staticmethod
    def _chunk_resume(content: str) -> list[dict[str, Any]]:
        """Splits resume into distinct sections and bullet points."""
        lines = [line.strip() for line in content.split("\n") if line.strip()]
        chunks = []
        current_section = "General"
        current_chunk_lines = []

        for line in lines:
            # Check for header-like lines (all caps, short, ending with colon)
            if len(line) < 40 and (line.isupper() or line.endswith(":")):
                if current_chunk_lines:
                    chunk_text = "\n".join(current_chunk_lines)
                    chunks.append({
                        "content": chunk_text,
                        "chunk_type": "resume_section",
                        "metadata": {"section": current_section},
                        "token_count": len(chunk_text.split()),
                    })
                    current_chunk_lines = []
                current_section = line.rstrip(":")
            else:
                current_chunk_lines.append(line)
                # If bullet point block reaches reasonable size, package it
                if len("\n".join(current_chunk_lines)) >= 450:
                    chunk_text = "\n".join(current_chunk_lines)
                    chunks.append({
                        "content": chunk_text,
                        "chunk_type": "resume_bullet_block",
                        "metadata": {"section": current_section},
                        "token_count": len(chunk_text.split()),
                    })
                    current_chunk_lines = []

        if current_chunk_lines:
            chunk_text = "\n".join(current_chunk_lines)
            chunks.append({
                "content": chunk_text,
                "chunk_type": "resume_section",
                "metadata": {"section": current_section},
                "token_count": len(chunk_text.split()),
            })

        return chunks or [{"content": content, "chunk_type": "full_resume", "metadata": {}, "token_count": len(content.split())}]

    @staticmethod
    def _chunk_job_description(content: str) -> list[dict[str, Any]]:
        """Splits job description by paragraphs and requirements."""
        paragraphs = re.split(r"\n\s*\n", content)
        chunks = []

        for i, para in enumerate(paragraphs):
            p = para.strip()
            if not p:
                continue
            chunks.append({
                "content": p,
                "chunk_type": "jd_paragraph",
                "metadata": {"paragraph_index": i},
                "token_count": len(p.split()),
            })

        return chunks or [{"content": content, "chunk_type": "full_jd", "metadata": {}, "token_count": len(content.split())}]

    @staticmethod
    def _chunk_generic(content: str, max_chars: int = 600, overlap_chars: int = 100) -> list[dict[str, Any]]:
        """Generic sliding-window chunker with paragraph boundary sensitivity."""
        paragraphs = re.split(r"\n\s*\n", content)
        chunks = []
        current_chunk = ""

        for para in paragraphs:
            p = para.strip()
            if not p:
                continue

            if len(current_chunk) + len(p) <= max_chars:
                current_chunk = f"{current_chunk}\n\n{p}".strip()
            else:
                if current_chunk:
                    chunks.append({
                        "content": current_chunk,
                        "chunk_type": "text_block",
                        "metadata": {},
                        "token_count": len(current_chunk.split()),
                    })
                # If paragraph itself is huge, split by sentences
                if len(p) > max_chars:
                    sentences = re.split(r"(?<=[.!?])\s+", p)
                    sub_chunk = ""
                    for s in sentences:
                        if len(sub_chunk) + len(s) <= max_chars:
                            sub_chunk = f"{sub_chunk} {s}".strip()
                        else:
                            if sub_chunk:
                                chunks.append({
                                    "content": sub_chunk,
                                    "chunk_type": "text_block",
                                    "metadata": {},
                                    "token_count": len(sub_chunk.split()),
                                })
                            sub_chunk = s
                    current_chunk = sub_chunk
                else:
                    current_chunk = p

        if current_chunk:
            chunks.append({
                "content": current_chunk,
                "chunk_type": "text_block",
                "metadata": {},
                "token_count": len(current_chunk.split()),
            })

        return chunks or [{"content": content, "chunk_type": "raw_text", "metadata": {}, "token_count": len(content.split())}]


chunker = DocumentChunker()
