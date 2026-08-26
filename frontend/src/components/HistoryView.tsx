import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useToast } from '../hooks/useToast';
import type { ChatSession, ChatMessageItem } from '../types';
import { 
  History, 
  RefreshCw, 
  Download, 
  Trash2, 
  Search, 
  MessageSquare,
  Clock,
  Copy,
  Check
} from 'lucide-react';

export function HistoryView() {
  const { showToast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await api.getSessions();
      const sessList: ChatSession[] = res.data;
      setSessions(sessList);
      if (sessList.length > 0 && !activeSessionId) {
        setActiveSessionId(sessList[0].session_id);
      }
    } catch (err: unknown) {
      console.warn('Failed to load sessions:', err);
    }
  }, [activeSessionId]);

  const fetchChatHistory = useCallback(async (sid: string) => {
    setLoading(true);
    try {
      const res = await api.getChatHistory(sid);
      setMessages(res.data);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to load conversation history.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    if (activeSessionId) {
      fetchChatHistory(activeSessionId);
    }
  }, [activeSessionId, fetchChatHistory]);

  const handleDeleteSession = async (sid: string) => {
    if (!confirm(`Delete this chat session from history?`)) return;
    try {
      await api.deleteSession(sid);
      showToast('Session removed from history.', 'success');
      setSessions((prev) => prev.filter((s) => s.session_id !== sid));
      if (activeSessionId === sid) {
        const remaining = sessions.filter((s) => s.session_id !== sid);
        setActiveSessionId(remaining.length > 0 ? remaining[0].session_id : null);
        setMessages([]);
      }
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete session.', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Clear all conversation history? This cannot be undone.')) return;
    try {
      await api.clearHistory();
      showToast('All conversation history cleared.', 'success');
      setSessions([]);
      setMessages([]);
      setActiveSessionId(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to clear history.', 'error');
    }
  };

  const handleExportJSON = () => {
    const payload = {
      sessions,
      current_session: activeSessionId,
      messages,
      exported_at: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrag_search_history_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported history archive.', 'success');
  };

  const handleCopyTranscript = async () => {
    if (messages.length === 0) return;
    const text = messages.map(m => `${m.role === 'user' ? 'User' : 'Q-GraphRAG'}: ${m.content}`).join('\n\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('Transcript copied to clipboard.', 'success');
  };

  const filteredSessions = sessions.filter(
    (s) =>
      s.session_id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (s.last_message && s.last_message.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  const activeSession = sessions.find(s => s.session_id === activeSessionId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Modern Compact History Header */}
      <div style={{
        padding: '14px 24px',
        borderBottom: '1px solid var(--bd)',
        background: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        boxShadow: 'var(--shadow-sm)',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 'var(--r-md)',
            background: 'var(--primary-lt)', border: '1px solid #c7d2fe',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <History size={18} color="var(--primary)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 className="font-headline" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--t1)' }}>
                Session &amp; Search History
              </h2>
              <span className="badge b-indigo" style={{ fontSize: '10px', padding: '1px 7px' }}>
                {sessions.length} {sessions.length === 1 ? 'Session' : 'Sessions'}
              </span>
            </div>
            <p style={{ color: 'var(--t3)', fontSize: '11.5px', marginTop: 1 }}>
              Browse and review past quantum retrieval queries and conversation transcripts
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchSessions} title="Refresh history">
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleExportJSON} disabled={sessions.length === 0} title="Export history as JSON">
            <Download size={13} />
            <span>Export Archive</span>
          </button>
          {sessions.length > 0 && (
            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red)' }} onClick={handleClearAll} title="Clear all history">
              <Trash2 size={13} />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column History Studio */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '320px 1fr', overflow: 'hidden' }}>
        
        {/* Left: Session List Sidebar */}
        <div style={{
          background: '#ffffff',
          borderRight: '1px solid var(--bd)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden'
        }}>
          {/* Search Box */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--bd-subtle)', background: '#f8fafc' }}>
            <div style={{ position: 'relative' }}>
              <Search size={13} color="var(--t4)" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                className="inp"
                type="text"
                placeholder="Search history queries…"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                style={{ fontSize: '12px', padding: '7px 10px 7px 30px' }}
              />
            </div>
          </div>

          {/* Session Cards Scroll */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filteredSessions.map((s) => {
              const active = s.session_id === activeSessionId;
              return (
                <div
                  key={s.session_id}
                  onClick={() => setActiveSessionId(s.session_id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--r-md)',
                    cursor: 'pointer',
                    background: active ? 'var(--primary-lt)' : '#ffffff',
                    border: active ? '1.5px solid #c7d2fe' : '1px solid var(--bd)',
                    transition: 'all var(--transition)',
                    boxShadow: active ? '0 2px 8px rgba(79, 70, 229, 0.12)' : 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <span style={{
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: active ? 'var(--primary-text)' : 'var(--t1)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '190px'
                    }}>
                      {s.last_message || s.session_id}
                    </span>
                    <span className="badge b-indigo" style={{ fontSize: '9.5px', padding: '1px 6px', flexShrink: 0 }}>
                      {s.message_count} {s.message_count === 1 ? 'msg' : 'msgs'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--t4)', marginTop: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} />
                      {s.timestamp ? new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </span>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteSession(s.session_id); }}
                      style={{ background: 'none', border: 'none', color: 'var(--t4)', cursor: 'pointer', padding: 2 }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--t4)'}
                      title="Delete session"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredSessions.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--t4)', fontSize: '12.5px' }}>
                <History size={28} style={{ margin: '0 auto 10px', opacity: 0.35, display: 'block' }} />
                No matching sessions found.
              </div>
            )}
          </div>
        </div>

        {/* Right: Conversation Transcript Canvas */}
        <div style={{
          background: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          overflow: 'hidden'
        }}>
          {/* Transcript Top Bar */}
          <div style={{
            padding: '12px 24px',
            borderBottom: '1px solid var(--bd)',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <div>
              <span className="font-headline" style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--t1)' }}>
                {activeSession?.last_message ? `Transcript: "${activeSession.last_message.slice(0, 50)}…"` : 'Conversation Transcript'}
              </span>
              {activeSessionId && (
                <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: 2 }}>
                  ID: <span className="mono" style={{ color: 'var(--t1)' }}>{activeSessionId}</span>
                </div>
              )}
            </div>

            {messages.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button className="btn btn-secondary btn-sm" onClick={handleCopyTranscript}>
                  {copied ? <Check size={12} color="var(--emerald)" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy All'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Transcript Message Scroll */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {loading && (
              <div style={{ textAlign: 'center', margin: 'auto', padding: 40, color: 'var(--t3)' }}>
                <span className="spin" style={{ margin: '0 auto 12px', display: 'block' }} />
                Loading conversation transcript…
              </div>
            )}

            {!loading && messages.map((m, idx) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m._id || idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    gap: 6,
                  }}
                  className="fade-in"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', color: 'var(--t4)' }}>
                    <span className={`badge ${isUser ? 'b-indigo' : 'badge-simple'}`} style={{ fontSize: '10px', padding: '1px 7px' }}>
                      {isUser ? 'You' : 'Q-GraphRAG'}
                    </span>
                    <span className="mono">{m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                  </div>
                  <div
                    style={{
                      maxWidth: '82%',
                      padding: '14px 18px',
                      borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isUser ? 'var(--primary)' : '#ffffff',
                      border: isUser ? 'none' : '1px solid var(--bd)',
                      color: isUser ? '#ffffff' : 'var(--t1)',
                      fontSize: '13.5px',
                      lineHeight: 1.65,
                      whiteSpace: 'pre-wrap',
                      boxShadow: isUser ? '0 2px 8px rgba(79, 70, 229, 0.25)' : 'var(--shadow-sm)',
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}

            {!loading && messages.length === 0 && (
              <div style={{ textAlign: 'center', margin: 'auto', padding: 60, color: 'var(--t4)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: 'var(--primary-lt)', border: '1px solid #c7d2fe',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <MessageSquare size={24} color="var(--primary)" />
                </div>
                <div>
                  <h4 className="font-headline" style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--t1)' }}>
                    No Active Transcript Selected
                  </h4>
                  <p style={{ color: 'var(--t3)', fontSize: '12.5px', marginTop: 4, maxWidth: 360 }}>
                    Select a conversation from the sidebar or start a new query in the Chat Workspace.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
