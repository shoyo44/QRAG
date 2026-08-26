import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useToast } from '../hooks/useToast';
import type { ScalabilityRow } from '../types';
import { Cpu, RefreshCw } from 'lucide-react';

function MemBar({ mb }: { mb: number }) {
  const pct   = Math.min((mb / 256) * 100, 100);
  const color = pct < 25 ? 'var(--emerald)' : pct < 65 ? 'var(--amber)' : 'var(--red)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: '6px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '99px' }} />
      </div>
      <span className="mono" style={{ fontSize: 11.5, color: 'var(--t2)', minWidth: 54, textAlign: 'right', fontWeight: 600 }}>
        {mb} MB
      </span>
    </div>
  );
}

function SimBadge({ n }: { n: number }) {
  if (n <= 6)  return <span className="badge b-green">Full State Vector</span>;
  if (n <= 12) return <span className="badge b-amber">Lightning Limit</span>;
  return              <span className="badge b-red">MPS Tensor Fallback</span>;
}

export function ScalabilityView() {
  const { showToast }           = useToast();
  const [rows, setRows]         = useState<ScalabilityRow[]>([]);
  const [loading, setLoading]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getScalability();
      setRows(res.data);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to load scalability profiler.', 'error');
    } finally { setLoading(false); }
  }, [showToast]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="card fade-in">
      <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--bd-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Cpu size={18} color="var(--primary)" />
          <div>
            <h3 className="font-headline" style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>
              Hilbert Space Dimension &amp; Hardware Memory Profiler
            </h3>
            <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
              State vector simulation complexity scaling $2^N$ for $N \in [2, 14]$ qubits on classical hardware.
            </p>
          </div>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={load} disabled={loading}>
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          <span>Profile Hardware</span>
        </button>
      </div>

      <div style={{ padding: 0 }}>
        {loading && rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--t3)' }}>
            <span className="spin" style={{ margin: '0 auto 12px', display: 'block' }} />
            Profiling PennyLane Lightning backend…
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bd-subtle)', background: '#f8fafc' }}>
                <th className="mono" style={{ padding: '12px 20px', fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 600 }}>Qubits (N)</th>
                <th className="mono" style={{ padding: '12px 20px', fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 600 }}>Hilbert Dim (2^N)</th>
                <th className="mono" style={{ padding: '12px 20px', fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 600, minWidth: 220 }}>RAM Usage</th>
                <th className="mono" style={{ padding: '12px 20px', fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 600 }}>Latency</th>
                <th className="mono" style={{ padding: '12px 20px', fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 600 }}>Target Architecture</th>
                <th className="mono" style={{ padding: '12px 20px', fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', fontWeight: 600 }}>Simulation Mode</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.num_qubits} style={{ borderBottom: '1px solid var(--bd-subtle)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <span className="mono font-headline" style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)' }}>{r.num_qubits}</span>
                  </td>
                  <td className="mono" style={{ padding: '14px 20px', color: 'var(--t1)', fontWeight: 600 }}>
                    {r.hilbert_space_dim.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 20px', minWidth: 220 }}>
                    <MemBar mb={r.memory_mb} />
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span className="mono" style={{
                      color: r.simulation_time_ms < 25  ? 'var(--emerald)'
                           : r.simulation_time_ms < 100 ? 'var(--amber)' : 'var(--red)',
                      fontWeight: 600
                    }}>
                      {r.simulation_time_ms} ms
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--t2)', fontSize: 12.5 }}>
                    {r.hardware_recommendation}
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <SimBadge n={r.num_qubits} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
