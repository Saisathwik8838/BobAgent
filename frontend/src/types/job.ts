export interface Job {
  id: string;
  candidate_id: string;
  title: string;
  company: string;
  url: string | null;
  raw_description: string;
  seniority: string;
  location: string | null;
  salary_range: string | null;
  mandatory_skills: string[];
  preferred_skills: string[];
  responsibilities: string[];
  parsed_requirements_json: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface JobCreatePayload {
  title: string;
  company: string;
  raw_description: string;
  url?: string;
  seniority?: string;
  location?: string;
  salary_range?: string;
}

export interface JobMatchResponse {
  job_id: string;
  resume_id: string;
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  match_rationale: string;
  evidence_citations: string[];
}
