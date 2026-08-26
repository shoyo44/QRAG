import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Zap, Activity, Database, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface LogEntry {
  query: string;
  intent: string;
  latency_ms: number;
  response: string;
  timestamp: string;
  details?: any;
}

export const AnalyticsView: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://${window.location.hostname}:8000/api/v1/analytics/logs?limit=30`);
      if (Array.isArray(res.data)) {
        setLogs(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const totalQueries = logs.length;
  const avgLatency = totalQueries > 0 ? (logs.reduce((acc, l) => acc + (l.latency_ms || 0), 0) / totalQueries).toFixed(0) : '0';
  const complexCount = logs.filter(l => l.intent === 'complex').length;
  const simpleCount = logs.filter(l => l.intent === 'simple').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 24, height: 'calc(100vh - 56px)', overflowY: 'auto' }}>
      {/* 4 Top KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            background: 'var(--primary-lt)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <BarChart3 size={22} color="var(--primary)" />
          </div>
          <div>
            <span style={{ fontSize: 11.5, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Total Executed Queries
            </span>
            <h3 className="font-headline mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--t1)', marginTop: 2 }}>
              {totalQueries}
            </h3>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            background: 'var(--secondary-lt)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Clock size={22} color="var(--secondary)" />
          </div>
          <div>
            <span style={{ fontSize: 11.5, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Avg Pipeline Latency
            </span>
            <h3 className="font-headline mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)', marginTop: 2 }}>
              {avgLatency} <span style={{ fontSize: '1rem', fontWeight: 600 }}>ms</span>
            </h3>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            background: '#f5f3ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={22} color="var(--purple)" />
          </div>
          <div>
            <span style={{ fontSize: 11.5, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Quantum Walks (Complex)
            </span>
            <h3 className="font-headline mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--purple)', marginTop: 2 }}>
              {complexCount}
            </h3>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 'var(--r-md)',
            background: 'var(--emerald-lt)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Database size={22} color="var(--emerald)" />
          </div>
          <div>
            <span style={{ fontSize: 11.5, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
              Vector Searches (Simple)
            </span>
            <h3 className="font-headline mono" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald)', marginTop: 2 }}>
              {simpleCount}
            </h3>
          </div>
        </div>
      </div>

      {/* Main Audit Trail Data Table */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--bd-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Activity size={18} color="var(--primary)" />
            <h3 className="font-headline" style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>
              Query Execution Audit Trail
            </h3>
          </div>
          <button onClick={fetchLogs} className="btn btn-secondary btn-sm">
            <RefreshCw size={13} className={loading ? 'spin' : ''} />
            <span>Refresh Logs</span>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bd-subtle)', background: '#f8fafc' }}>
                <th style={{ padding: '12px 20px', fontSize: 11.5, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Timestamp</th>
                <th style={{ padding: '12px 20px', fontSize: 11.5, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Query Text</th>
                <th style={{ padding: '12px 20px', fontSize: 11.5, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Intent Route</th>
                <th style={{ padding: '12px 20px', fontSize: 11.5, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>Latency</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '60px', color: 'var(--t4)' }}>
                    No audit log records found yet. Run queries in the Chat Workspace to view live telemetry.
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--bd-subtle)', transition: 'background 0.15s' }}>
                    <td className="mono" style={{ padding: '14px 20px', color: 'var(--t3)', fontSize: '12px' }}>
                      {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/A'}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 500, color: 'var(--t1)', maxWidth: '420px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {log.query}
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span className={`badge ${log.intent === 'complex' ? 'badge-complex' : 'badge-simple'}`}>
                        {log.intent || 'simple'}
                      </span>
                    </td>
                    <td className="mono" style={{ padding: '14px 20px', color: 'var(--primary-text)', fontWeight: 600 }}>
                      {log.latency_ms ? `${log.latency_ms.toFixed(0)} ms` : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
