const API_BASE = '/api/v1';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('bobagent_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('bobagent_token', token);
    } else {
      localStorage.removeItem('bobagent_token');
    }
  }

  getToken() {
    return this.token;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async checkHealth() {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return res.json();
  }

  async register(data) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    const result = await res.json();
    this.setToken(result.access_token);
    return result;
  }

  async login(data) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Invalid credentials');
    }
    const result = await res.json();
    this.setToken(result.access_token);
    return result;
  }

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      this.setToken(null);
      throw new Error('Session expired');
    }
    return res.json();
  }

  async getProfile() {
    const res = await fetch(`${API_BASE}/profile/`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  }

  async updateProfile(data) {
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
  async ingestDocument(payload) {
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

  async listDocuments() {
    const res = await fetch(`${API_BASE}/rag/documents`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to list documents');
    return res.json();
  }

  async queryRAG(payload) {
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

  async deleteDocument(documentId) {
    const res = await fetch(`${API_BASE}/rag/documents/${documentId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete document');
  }

  // ResumeHub API methods
  async createResume(payload) {
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

  async listResumes() {
    const res = await fetch(`${API_BASE}/resumes`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to list resumes');
    return res.json();
  }

  async getResume(id) {
    const res = await fetch(`${API_BASE}/resumes/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch resume');
    return res.json();
  }

  async tailorResume(resumeId, jobId) {
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

  async deleteResume(id) {
    const res = await fetch(`${API_BASE}/resumes/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete resume');
  }

  // Job Intelligence API methods
  async createJob(payload) {
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

  async listJobs() {
    const res = await fetch(`${API_BASE}/jobs`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to list jobs');
    return res.json();
  }

  async getJob(id) {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch job');
    return res.json();
  }

  async matchJob(jobId, resumeId) {
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

  async deleteJob(id) {
    const res = await fetch(`${API_BASE}/jobs/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete job');
  }

  // Applications Pipeline API methods
  async createApplication(payload) {
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

  async listApplications(status) {
    const url = status ? `${API_BASE}/applications?status=${status}` : `${API_BASE}/applications`;
    const res = await fetch(url, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to list applications');
    return res.json();
  }

  async getApplication(id) {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch application');
    return res.json();
  }

  async updateApplication(id, payload) {
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

  async deleteApplication(id) {
    const res = await fetch(`${API_BASE}/applications/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete application');
  }

  // LangGraph Multi-Agent Studio
  async runAgent(payload) {
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
  async startInterviewSession(payload) {
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

  async evaluateAnswer(payload) {
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
  async getAnalyticsDashboard() {
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
