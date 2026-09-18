import { AuthResponse, CandidateProfile, User } from '../types/auth';

const API_BASE = '/api/v1';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('bobagent_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('bobagent_token', token);
    } else {
      localStorage.removeItem('bobagent_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async checkHealth(): Promise<{ status: string; app_name: string; environment: string }> {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  }

  async register(data: { email: string; password: string; full_name: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    const result: AuthResponse = await res.json();
    this.setToken(result.access_token);
    return result;
  }

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Invalid credentials');
    }
    const result: AuthResponse = await res.json();
    this.setToken(result.access_token);
    return result;
  }

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      this.setToken(null);
      throw new Error('Session expired');
    }
    return res.json();
  }

  async getProfile(): Promise<CandidateProfile> {
    const res = await fetch(`${API_BASE}/profile/`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  }

  async updateProfile(data: Partial<CandidateProfile>): Promise<CandidateProfile> {
    const res = await fetch(`${API_BASE}/profile/`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update profile');
    }
    return res.json();
  }

  // Vector RAG API methods
  async ingestDocument(payload: {
    title: string;
    document_type: string;
    content: string;
    metadata?: Record<string, any>;
  }): Promise<import('../types/rag').RAGDocument> {
    const res = await fetch(`${API_BASE}/rag/ingest`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to ingest document');
    }
    return res.json();
  }

  async listDocuments(): Promise<import('../types/rag').RAGDocument[]> {
    const res = await fetch(`${API_BASE}/rag/documents`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to list documents');
    return res.json();
  }

  async queryRAG(payload: {
    query: string;
    top_k?: number;
    document_type?: string | null;
  }): Promise<import('../types/rag').RAGQueryResponse> {
    const res = await fetch(`${API_BASE}/rag/query`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Query failed');
    }
    return res.json();
  }

  async deleteDocument(documentId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/rag/documents/${documentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete document');
  }

  // ResumeHub API methods
  async createResume(payload: import('../types/resume').ResumeCreatePayload): Promise<import('../types/resume').Resume> {
    const res = await fetch(`${API_BASE}/resumes`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to upload resume');
    }
    return res.json();
  }

  async listResumes(): Promise<import('../types/resume').Resume[]> {
    const res = await fetch(`${API_BASE}/resumes`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to list resumes');
    return res.json();
  }

  async getResume(id: string): Promise<import('../types/resume').Resume> {
    const res = await fetch(`${API_BASE}/resumes/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch resume');
    return res.json();
  }

  async tailorResume(resumeId: string, jobId: string): Promise<import('../types/resume').ResumeTailorResponse> {
    const res = await fetch(`${API_BASE}/resumes/${resumeId}/tailor`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ job_id: jobId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to tailor resume');
    }
    return res.json();
  }

  async deleteResume(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/resumes/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete resume');
  }

  // Job Intelligence API methods
  async createJob(payload: import('../types/job').JobCreatePayload): Promise<import('../types/job').Job> {
    const res = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to ingest job');
    }
    return res.json();
  }

  async listJobs(): Promise<import('../types/job').Job[]> {
    const res = await fetch(`${API_BASE}/jobs`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to list jobs');
    return res.json();
  }

  async getJob(id: string): Promise<import('../types/job').Job> {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch job');
    return res.json();
  }

  async matchJob(jobId: string, resumeId?: string): Promise<import('../types/job').JobMatchResponse> {
    const url = resumeId
      ? `${API_BASE}/jobs/${jobId}/match?resume_id=${resumeId}`
      : `${API_BASE}/jobs/${jobId}/match`;
    const res = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to match job to resume');
    }
    return res.json();
  }

  async deleteJob(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete job');
  }

  // Applications Pipeline API methods
  async createApplication(payload: import('../types/application').ApplicationCreatePayload): Promise<import('../types/application').Application> {
    const res = await fetch(`${API_BASE}/applications`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to track application');
    }
    return res.json();
  }

  async listApplications(status?: string): Promise<import('../types/application').Application[]> {
    const url = status ? `${API_BASE}/applications?status=${status}` : `${API_BASE}/applications`;
    const res = await fetch(url, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to list applications');
    return res.json();
  }

  async getApplication(id: string): Promise<import('../types/application').Application> {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch application');
    return res.json();
  }

  async updateApplication(
    id: string,
    payload: import('../types/application').ApplicationUpdatePayload
  ): Promise<import('../types/application').Application> {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to update application');
    }
    return res.json();
  }

  async deleteApplication(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete application');
  }

  // LangGraph Multi-Agent Studio
  async runAgent(payload: import('../types/agent').AgentRunRequest): Promise<import('../types/agent').AgentRunResponse> {
    const res = await fetch(`${API_BASE}/agents/run`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Agent execution failed');
    }
    return res.json();
  }

  // Adaptive Interview Simulator
  async startInterviewSession(
    payload: import('../types/interview').InterviewStartRequest
  ): Promise<import('../types/interview').InterviewSessionResponse> {
    const res = await fetch(`${API_BASE}/interview/sessions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to start interview session');
    }
    return res.json();
  }

  async evaluateAnswer(
    payload: import('../types/interview').InterviewAnswerRequest
  ): Promise<import('../types/interview').AnswerEvaluationResponse> {
    const res = await fetch(`${API_BASE}/interview/evaluate`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Answer evaluation failed');
    }
    return res.json();
  }

  // Evaluation & Career Analytics
  async getAnalyticsDashboard(): Promise<import('../types/eval').AnalyticsDashboardResponse> {
    const res = await fetch(`${API_BASE}/eval/dashboard`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to fetch analytics metrics');
    }
    return res.json();
  }

  logout() {
    this.setToken(null);
  }
}

export const api = new ApiService();
