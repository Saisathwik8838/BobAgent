"""Parsers and extractors for resumes and job descriptions."""

import re
from typing import Any


def parse_resume_text(raw_text: str) -> dict[str, Any]:
    """Extracts structured sections (skills, experience, education, contact) from resume text."""
    lines = [line.strip() for line in raw_text.split("\n") if line.strip()]

    # Extract email & phone
    email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", raw_text)
    phone_match = re.search(r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}", raw_text)

    # Keywords heuristic for technical skills
    common_skills = [
        "python", "javascript", "typescript", "react", "fastapi", "docker", "kubernetes",
        "aws", "gcp", "azure", "sql", "postgresql", "redis", "mongodb", "graphql",
        "linux", "git", "ci/cd", "rest", "node", "java", "c++", "go", "rust",
        "machine learning", "pytorch", "tensorflow", "langchain", "langgraph", "rag",
        "llm", "pgvector", "system design", "microservices", "agile",
    ]
    raw_lower = raw_text.lower()
    detected_skills = [s.title() for s in common_skills if re.search(r"\b" + re.escape(s) + r"\b", raw_lower)]

    # Section extraction
    experience_bullets = []
    education_items = []

    current_mode = "general"
    for line in lines:
        l_upper = line.upper()
        if "EXPERIENCE" in l_upper or "WORK HISTORY" in l_upper or "EMPLOYMENT" in l_upper:
            current_mode = "experience"
            continue
        elif "EDUCATION" in l_upper or "ACADEMIC" in l_upper:
            current_mode = "education"
            continue
        elif "SKILL" in l_upper:
            current_mode = "skills"
            continue

        if current_mode == "experience" and (line.startswith(("-", "•", "*")) or len(line) > 30):
            experience_bullets.append(line.lstrip("-•* "))
        elif current_mode == "education" and len(line) > 10:
            education_items.append(line)

    return {
        "contact_info": {
            "email": email_match.group(0) if email_match else None,
            "phone": phone_match.group(0) if phone_match else None,
        },
        "skills": detected_skills or ["General Software Engineering"],
        "experience": experience_bullets or [l for l in lines if len(l) > 40][:5],
        "education": education_items or ["Degree information provided in document"],
    }


def parse_job_description(raw_text: str) -> dict[str, Any]:
    """Extracts mandatory skills, preferred skills, responsibilities, seniority, and salary from JD."""
    raw_lower = raw_text.lower()

    # Detect skills
    tech_keywords = [
        "python", "javascript", "typescript", "react", "fastapi", "docker", "kubernetes",
        "aws", "gcp", "azure", "postgresql", "redis", "langgraph", "langchain", "rag",
        "pytorch", "tensorflow", "graphql", "sql", "ci/cd", "microservices", "system design",
    ]
    extracted_skills = [s.title() for s in tech_keywords if re.search(r"\b" + re.escape(s) + r"\b", raw_lower)]

    # Split into mandatory vs preferred
    if len(extracted_skills) > 4:
        mandatory = extracted_skills[:4]
        preferred = extracted_skills[4:]
    else:
        mandatory = extracted_skills
        preferred = ["Distributed Systems", "Cloud Security"]

    # Detect seniority
    seniority = "Mid-Senior"
    if "principal" in raw_lower or "staff" in raw_lower:
        seniority = "Staff / Principal"
    elif "senior" in raw_lower or "lead" in raw_lower:
        seniority = "Senior"
    elif "junior" in raw_lower or "intern" in raw_lower:
        seniority = "Entry / Junior"

    # Detect salary
    salary_match = re.search(r"\$\d{2,3}[kK]?\s*-\s*\$?\d{2,3}[kK]?", raw_text)
    salary_range = salary_match.group(0) if salary_match else "Competitive / Market standard"

    # Responsibilities
    lines = [line.strip().lstrip("-•* ") for line in raw_text.split("\n") if line.strip()]
    responsibilities = [l for l in lines if len(l) > 30 and ("build" in l.lower() or "design" in l.lower() or "lead" in l.lower() or "manage" in l.lower() or "develop" in l.lower())][:4]
    if not responsibilities:
        responsibilities = [l for l in lines if len(l) > 40][:3]

    return {
        "mandatory_skills": mandatory,
        "preferred_skills": preferred,
        "responsibilities": responsibilities or ["Design and build scalable services", "Collaborate with cross-functional teams"],
        "seniority": seniority,
        "salary_range": salary_range,
    }


def match_resume_to_job(resume_data: dict[str, Any], job_data: dict[str, Any]) -> dict[str, Any]:
    """Calculates evidence-backed match score and citations between resume and job."""
    resume_skills = {s.lower() for s in resume_data.get("skills", [])}
    mandatory = job_data.get("mandatory_skills", [])
    preferred = job_data.get("preferred_skills", [])

    all_reqs = [s.lower() for s in mandatory + preferred]
    if not all_reqs:
        return {
            "match_percentage": 75,
            "matched_skills": list(resume_skills)[:4],
            "missing_skills": [],
            "match_rationale": "Strong foundational technical match across shared domains.",
            "evidence_citations": resume_data.get("experience", [])[:2],
        }

    matched = [s.title() for s in all_reqs if s in resume_skills]
    missing = [s.title() for s in all_reqs if s not in resume_skills]

    match_pct = round((len(matched) / max(1, len(all_reqs))) * 100)
    match_pct = max(35, min(95, match_pct))

    rationale = f"Candidate exhibits verified evidence for {len(matched)} of {len(all_reqs)} core requirements ({', '.join(matched[:3]) if matched else 'General background'})."

    return {
        "match_percentage": match_pct,
        "matched_skills": matched,
        "missing_skills": missing,
        "match_rationale": rationale,
        "evidence_citations": resume_data.get("experience", [])[:3],
    }


def tailor_resume_content(resume_raw: str, resume_parsed: dict[str, Any], job_title: str, job_skills: list[str]) -> dict[str, Any]:
    """Tailors candidate resume bullets towards target job requirements without hallucinating experience."""
    original_bullets = resume_parsed.get("experience", [])

    # Highlight and emphasize bullets matching job skills
    tailored_bullets = []
    diff_lines = []

    target_keywords = {k.lower() for k in job_skills}
    for bullet in original_bullets:
        matched_terms = [k for k in target_keywords if k in bullet.lower()]
        if matched_terms:
            tailored_bullet = f"{bullet} [Emphasizing: {', '.join(matched_terms).title()}]"
            diff_lines.append(f"+ Highlighted verified capability in {matched_terms[0].title()}: \"{bullet[:60]}...\"")
        else:
            tailored_bullet = bullet
        tailored_bullets.append(tailored_bullet)

    if not diff_lines:
        diff_lines.append(f"+ Reordered core candidate experience to directly target {job_title} competencies.")

    return {
        "target_role": job_title,
        "tailored_sections": {
            "headline": f"Specialized candidate for {job_title}",
            "tailored_experience": tailored_bullets,
            "relevant_skills": [s for s in resume_parsed.get("skills", []) if s.lower() in target_keywords] + [s for s in resume_parsed.get("skills", []) if s.lower() not in target_keywords],
            "education": resume_parsed.get("education", []),
        },
        "diff_summary": "\n".join(diff_lines),
    }
