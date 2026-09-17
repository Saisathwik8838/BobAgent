export interface ResumeVersion {
  id: string;
  resume_id: string;
  job_id: string | null;
  version_number: number;
  target_role: string;
  tailored_content_json: {
    headline?: string;
    tailored_experience?: string[];
    relevant_skills?: string[];
    education?: string[];
  };
  diff_summary: string;
  created_at: string;
}

export interface Resume {
  id: string;
  candidate_id: string;
  title: string;
  file_name: string | null;
  raw_text: string;
  parsed_json: {
    contact_info?: { email?: string; phone?: string };
    skills?: string[];
    experience?: string[];
    education?: string[];
  };
  is_primary: boolean;
  versions: ResumeVersion[];
  created_at: string;
  updated_at: string;
}

export interface ResumeCreatePayload {
  title: string;
  raw_text: string;
  file_name?: string;
  is_primary?: boolean;
}

export interface ResumeTailorResponse {
  version: ResumeVersion;
  grounded_evidence_cited: string[];
  diff_summary: string;
}
