export interface AgentStepTrace {
  step_number: number;
  agent_name: string;
  action: string;
  status: string;
  tool_called: string | null;
  observation: string;
  duration_ms: number;
}

export interface AgentRunRequest {
  agent_type: 'job_scout' | 'application_assistant' | 'prep_coach';
  job_id?: string;
  parameters?: Record<string, any>;
}

export interface AgentRunResponse {
  run_id: string;
  agent_type: string;
  status: string;
  summary: string;
  outputs: Record<string, any>;
  traces: AgentStepTrace[];
  groundedness_score: number;
  evidence_citations: string[];
  created_at: string;
}
