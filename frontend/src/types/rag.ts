export interface RAGDocument {
  id: string;
  candidate_id: string;
  title: string;
  document_type: string;
  chunk_count: number;
  created_at: string;
  updated_at: string;
}

export interface RAGIngestPayload {
  title: string;
  document_type: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface RAGQueryPayload {
  query: string;
  top_k?: number;
  document_type?: string | null;
}

export interface RAGQueryMatch {
  chunk_id: string;
  document_id: string;
  document_title: string;
  document_type: string;
  content: string;
  similarity_score: number;
  metadata: Record<string, any>;
}

export interface RAGQueryResponse {
  query: string;
  total_matches: number;
  matches: RAGQueryMatch[];
}
