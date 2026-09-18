export interface InterviewQuestion {
  id: string;
  question_text: string;
  category: string;
  expected_points: string[];
}

export interface InterviewSessionResponse {
  session_id: string;
  role_title: string;
  difficulty: string;
  questions: InterviewQuestion[];
}

export interface InterviewStartRequest {
  job_id?: string;
  role_title?: string;
  difficulty?: string;
}

export interface InterviewAnswerRequest {
  session_id: string;
  question_id: string;
  answer_text: string;
}

export interface AnswerEvaluationResponse {
  question_id: string;
  score: number;
  correctness: number;
  clarity: number;
  depth: number;
  feedback: string;
  missing_concepts: string[];
  grounded_suggestion: string;
}
