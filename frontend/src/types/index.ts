export interface HealthStatus {
  status: string;
  llm_provider: string;
  embed_provider: string;
  max_qubits_limit: number;
  local_graph_nodes: number;
}

export interface MongoStatus {
  connected: boolean;
  mode: string;
  db_name: string;
  collection_name: string;
  cluster_host: string;
  ping_latency_ms: number;
  total_chats: number;
  total_query_logs: number;
  use_fallback: boolean;
}

export interface ChatSession {
  session_id: string;
  message_count: number;
  last_message: string;
  timestamp: string;
}

export interface ChatMessageItem {
  _id?: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: any;
  timestamp: string;
}

export interface AblationResult {
  mode: string;
  latency_ms: number;
  answer: string;
  contexts_retrieved: number;
  exact_match: number;
  token_precision: number;
  token_recall: number;
  answer_f1: number;
  retrieval_precision_at_k: number;
  retrieval_recall_at_k: number;
  retrieval_f1_at_k: number;
  quantum_kernel_similarity?: number;
  ragas?: {
    faithfulness?: number;
    answer_relevance?: number;
    context_precision?: number;
    context_recall?: number;
    overall_ragas_score?: number;
  };
}

export type AblationData = Record<'pure_vector' | 'classical_graph' | 'quantum_graph', AblationResult>;

export interface ScalabilityRow {
  num_qubits: number;
  hilbert_space_dim: number;
  memory_mb: number;
  simulation_time_ms: number;
  status: string;
  hardware_recommendation: string;
}

export type TabKey = 'home' | 'login' | 'chat' | 'graph' | 'documents' | 'analytics' | 'history' | 'research';
export type ResearchTabKey = 'ablation' | 'scalability' | 'openqasm';
