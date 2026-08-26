import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import type { HealthStatus } from '../types';

export function useHealth(intervalMs = 15000) {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = useCallback(async () => {
    try {
      const res = await api.getHealth();
      setHealth(res.data);
    } catch {
      setHealth({
        status: 'offline',
        llm_provider: '—',
        embed_provider: '—',
        max_qubits_limit: 14,
        local_graph_nodes: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const id = setInterval(fetchHealth, intervalMs);
    return () => clearInterval(id);
  }, [fetchHealth, intervalMs]);

  return { health, loading, refetch: fetchHealth };
}
