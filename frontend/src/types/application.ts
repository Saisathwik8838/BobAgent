import { Job } from './job';

export interface ApplicationEvent {
  id: string;
  application_id: string;
  event_type: string;
  description: string;
  metadata_json: Record<string, any>;
  created_at: string;
}

export type ApplicationStatus = 'saved' | 'applied' | 'interviewing' | 'offer' | 'rejected' | 'withdrawn';

export interface Application {
  id: string;
  candidate_id: string;
  job_id: string;
  resume_id: string | null;
  status: ApplicationStatus;
  applied_date: string | null;
  notes: string;
  salary_offered: string | null;
  contact_name: string | null;
  contact_email: string | null;
  created_at: string;
  updated_at: string;
  job?: Job;
  events?: ApplicationEvent[];
}

export interface ApplicationCreatePayload {
  job_id: string;
  resume_id?: string;
  status?: ApplicationStatus;
  notes?: string;
  applied_date?: string;
  salary_offered?: string;
  contact_name?: string;
  contact_email?: string;
}

export interface ApplicationUpdatePayload {
  status?: ApplicationStatus;
  notes?: string;
  resume_id?: string;
  applied_date?: string;
  salary_offered?: string;
  contact_name?: string;
  contact_email?: string;
}
