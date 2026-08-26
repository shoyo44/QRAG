import axios from 'axios';

const BASE_URL = `http://${window.location.hostname}:8000`;

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

/* Global response interceptor */
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.detail ||
      err?.response?.data?.message ||
      err?.message ||
      'Unknown error';
    console.error('[API Error]', message, err);
    return Promise.reject(new Error(message));
  }
);

/* ── API surface ── */
export const api = {
  getHealth: () => client.get('/health'),

  // Knowledge Graph Visualization
  getGraph: () => client.get('/api/v1/graph'),

  // Document ingestion
  uploadDocument: (title: string, content: string, metadata?: Record<string, unknown>) =>
    client.post('/api/v1/documents/upload', { title, content, metadata }),

  uploadFile: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return client.post('/api/v1/documents/upload-file', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteDocument: (docId: string) =>
    client.delete(`/api/v1/documents/${encodeURIComponent(docId)}`),

  // Query (REST)
  query: (query: string, sessionId?: string, docId?: string) =>
    client.post('/api/v1/query', { query, session_id: sessionId, doc_id: docId }),

  // Research & Evaluation
  runAblation: (query: string) =>
    client.post('/api/v1/research/ablation', { query }),

  getScalability: () =>
    client.get('/api/v1/research/scalability'),

  getPaperManifest: () =>
    client.get('/api/v1/research/paper/manifest'),

  // History & Storage
  getMongoStatus: () =>
    client.get('/api/v1/history/mongo-status'),

  getSessions: () =>
    client.get('/api/v1/history/sessions'),

  getChatHistory: (sessionId: string) =>
    client.get(`/api/v1/chat/history?session_id=${encodeURIComponent(sessionId)}`),

  deleteSession: (sessionId: string) =>
    client.delete(`/api/v1/history/session/${encodeURIComponent(sessionId)}`),

  clearHistory: () =>
    client.delete('/api/v1/history/clear'),

  getAnalyticsLogs: (limit: number = 50) =>
    client.get(`/api/v1/analytics/logs?limit=${limit}`),
};

export default client;
