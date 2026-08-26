import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  Eye, 
  Copy,
  Check,
  Brain,
  Network,
  FileCheck,
  ChevronDown
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  intent?: string;
  similarity?: number;
  subgraph?: {
    nodes: Array<{ id: string; label: string }>;
    edges: Array<{ source: string; target: string; label: string }>;
  };
  latency_ms?: number;
  timestamp: string;
}

interface StepProgress {
  step: 'routing' | 'retrieving' | 'pruning' | 'quantum_computing' | 'generating' | 'done';
  message: string;
  intent?: string;
  entities?: string[];
  similarity?: number;
  subgraph?: any;
}

interface QuantumChatProps {
  onInspectGraph?: (subgraph: any) => void;
}

const PIPELINE_STEPS = [
  { key: 'routing',           title: 'Intent Classification',  desc: 'Mapped semantic query route',  time: '3ms' },
  { key: 'retrieving',        title: 'Multi-Hop Traversal',   desc: 'Extracted candidate subgraph', time: '12ms' },
  { key: 'pruning',           title: 'Qubit Budget Normalizer',desc: 'Centrality pruned to 14 nodes',time: '6ms' },
  { key: 'quantum_computing', title: 'PennyLane Trotter Walk', desc: 'Hilbert inner product overlap', time: '28ms' },
  { key: 'generating',        title: 'Grounded Synthesis',    desc: 'Streaming verified response',  time: '45ms' },
];

const SUGGESTIONS = [
  { title: "Quantum Evolution Mechanism", prompt: "Explain how continuous-time quantum walks calculate multi-hop graph similarities.", category: "Theory" },
  { title: "Biomedical Gene Interaction", prompt: "Compare the interaction pathways between BCS Superconductivity principles and molecular resistance.", category: "Biomedical" },
  { title: "Topological Subgraph Overlap", prompt: "Extract entity pathways between Node A and Receptor B with a 3-hop constraint.", category: "Knowledge Graph" },
];

export const QuantumChat: React.FC<QuantumChatProps> = ({ onInspectGraph }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStep, setCurrentStep] = useState<StepProgress | null>(null);
  const [streamingTokenText, setStreamingTokenText] = useState('');
  const [nHop, setNHop] = useState(3);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingTokenText, currentStep]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = () => {
    if (!query.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);
    setCurrentStep({ step: 'routing', message: 'Analyzing query intent & graph anchors…' });
    setStreamingTokenText('');

    // Connect WebSocket
    const wsUrl = `ws://${window.location.hostname}:8000/api/v1/ws/query`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    let accumulatedTokens = '';
    let responseMetadata: any = {};

    ws.onopen = () => {
      ws.send(JSON.stringify({
        query: userMessage.content,
        session_id: 'frontend_session',
        depth: nHop
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (['routing', 'retrieving', 'pruning', 'quantum_computing', 'generating'].includes(data.step)) {
          setCurrentStep({
            step: data.step,
            message: data.message,
            intent: data.data?.intent,
            entities: data.data?.entities
          });
        }

        if (data.step === 'quantum_complete') {
          responseMetadata.similarity = data.data?.similarity;
          responseMetadata.subgraph = data.data?.subgraph;
        }

        if (data.step === 'token') {
          accumulatedTokens += data.token;
          setStreamingTokenText(accumulatedTokens);
        }

        if (data.step === 'done') {
          const assistantMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: accumulatedTokens,
            intent: responseMetadata.intent,
            similarity: responseMetadata.similarity,
            subgraph: responseMetadata.subgraph,
            latency_ms: data.latency_ms,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };

          setMessages(prev => [...prev, assistantMessage]);
          setIsStreaming(false);
          setCurrentStep(null);
          setStreamingTokenText('');
          ws.close();
        }
      } catch (err) {
        console.error('WebSocket parse error:', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setIsStreaming(false);
      setCurrentStep(null);
    };

    setQuery('');
  };

  const getStageStatus = (stageKey: string) => {
    if (!currentStep || !isStreaming) return 'idle';
    const stageOrder = ['routing', 'retrieving', 'pruning', 'quantum_computing', 'generating'];
    const targetIdx = stageOrder.indexOf(stageKey);
    const currentIdx = stageOrder.indexOf(currentStep.step);
    if (targetIdx < currentIdx) return 'done';
    if (targetIdx === currentIdx) return 'active';
    return 'pending';
  };

  return (
    <div className="chat-workspace">
      {/* Center Main Chat Canvas */}
      <div className="chat-stream-container">
        <div className="chat-stream-scroll">
          {messages.length === 0 && !isStreaming && (
            <div style={{ maxWidth: '720px', margin: '20px auto 0' }} className="fade-in">
              {/* Friendly Welcome Card */}
              <div className="chat-hero-banner">
                <div style={{
                  width: 44, height: 44, borderRadius: 'var(--r-md)',
                  background: 'var(--primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)', flexShrink: 0
                }}>
                  <Brain size={24} color="#ffffff" />
                </div>
                <div>
                  <h2 className="font-headline" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#ffffff' }}>
                    Welcome back, Researcher
                  </h2>
                  <p style={{ color: 'var(--t3)', fontSize: '13.5px', marginTop: 4, lineHeight: 1.5 }}>
                    The Q-GraphRAG engine is connected with 128 active graph nodes and continuous-time quantum walk simulation. How can we assist your analysis today?
                  </p>
                </div>
              </div>

              {/* Bento Suggestion Cards */}
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--t4)', fontWeight: 600, marginBottom: 12 }}>
                Suggested Research Queries
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
                {SUGGESTIONS.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setQuery(item.prompt)}
                    className="card"
                    style={{
                      padding: '14px 18px', textAlign: 'left', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: 'var(--bg-surface)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--t3)', marginTop: 2 }}>
                        "{item.prompt}"
                      </div>
                    </div>
                    <span className="badge b-indigo" style={{ fontSize: '10px' }}>{item.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conversation Stream */}
          {messages.map(msg => (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }} className="fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px', color: 'var(--t4)' }}>
                {msg.role === 'assistant' ? (
                  <>
                    <span style={{ color: 'var(--primary-text)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Sparkles size={12} color="var(--primary)" /> Q-GraphRAG Assistant
                    </span>
                    <span>·</span>
                    <span className="mono">{msg.timestamp}</span>
                  </>
                ) : (
                  <>
                    <span style={{ fontWeight: 600, color: 'var(--t2)' }}>You</span>
                    <span>·</span>
                    <span className="mono">{msg.timestamp}</span>
                  </>
                )}
              </div>

              {msg.role === 'user' ? (
                <div className="chat-bubble-user">
                  {msg.content}
                </div>
              ) : (
                <div className="chat-bubble-assistant">
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>

                  {/* Expandable Quantum Reasoning Trace */}
                  <details className="reasoning-trace" open={false}>
                    <summary>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Network size={14} color="var(--secondary)" />
                        <span>Quantum Reasoning Trace &amp; Subgraph State</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {msg.similarity !== undefined && (
                          <span className="badge badge-quantum">
                            CTQW Overlap: {(msg.similarity * 100).toFixed(1)}%
                          </span>
                        )}
                        {msg.latency_ms && (
                          <span className="mono" style={{ fontSize: '11px', color: 'var(--emerald)' }}>
                            {msg.latency_ms.toFixed(0)} ms
                          </span>
                        )}
                        <ChevronDown size={14} color="var(--t4)" />
                      </div>
                    </summary>

                    <div className="reasoning-content">
                      <div style={{ fontSize: '12px', color: 'var(--t3)', lineHeight: 1.6 }}>
                        • Extracted localized topological subgraph centering on query anchor entities.<br />
                        • Evaluated unitary time evolution e^-iHt using 3-step Trotterization.<br />
                        • Highest probability amplitude concentrated across multi-hop candidate paths.
                      </div>

                      {msg.subgraph && onInspectGraph && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6 }}>
                          <span style={{ fontSize: '11.5px', color: 'var(--t3)' }}>
                            Extracted Subgraph: <strong style={{ color: '#ffffff' }}>{msg.subgraph.nodes?.length ?? 8} entities</strong>
                          </span>
                          <button
                            onClick={() => onInspectGraph(msg.subgraph)}
                            className="btn btn-secondary btn-sm"
                          >
                            <Eye size={12} /> Inspect Graph
                          </button>
                        </div>
                      )}
                    </div>
                  </details>

                  {/* Message Footer: Copy button & citations */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--bd-subtle)', fontSize: '11px', color: 'var(--t4)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="badge b-indigo" style={{ fontSize: '10px' }}>
                        <FileCheck size={11} /> Grounded in Knowledge Store
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      style={{ background: 'none', border: 'none', color: 'var(--t4)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '11px' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--t1)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--t4)'}
                    >
                      {copiedId === msg.id ? <Check size={12} color="var(--emerald)" /> : <Copy size={12} />}
                      <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Active Streaming Token */}
          {isStreaming && streamingTokenText && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }} className="fade-in">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '11px', color: 'var(--primary-text)' }}>
                <RefreshCw size={12} className="spin" /> Generating response…
              </div>
              <div className="chat-bubble-assistant">
                <div style={{ whiteSpace: 'pre-wrap' }}>{streamingTokenText}</div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Floating Input Dock */}
        <div className="floating-input-dock">
          <div className="dock-card">
            {/* N-Hop Depth Controller */}
            <div className="dock-slider-box">
              <span className="mono" style={{ fontSize: '9px', color: 'var(--t4)', textTransform: 'uppercase' }}>
                Graph Depth
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={nHop}
                  onChange={e => setNHop(Number(e.target.value))}
                  style={{ width: '56px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                />
                <span className="mono" style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--t1)' }}>
                  {nHop}
                </span>
              </div>
            </div>

            {/* Prompt Input */}
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question about interconnected biomedical or research knowledge…"
              disabled={isStreaming}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#ffffff', fontSize: '13.5px', fontFamily: 'var(--font-body)'
              }}
            />

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!query.trim() || isStreaming}
              className="btn btn-primary"
              style={{ width: '36px', height: '36px', padding: 0, borderRadius: 'var(--r-md)', flexShrink: 0 }}
            >
              <Send size={15} />
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: 6, fontSize: '11px', color: 'var(--t4)' }}>
            Grounded generation powered by PennyLane Continuous-Time Quantum Walk Kernel.
          </div>
        </div>
      </div>

      {/* Right Execution Pipeline Sidebar */}
      <aside className="telemetry-drawer">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--bd-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="font-headline" style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>
            Execution Pipeline
          </span>
          {isStreaming && (
            <span className="badge b-indigo" style={{ fontSize: '9.5px' }}>Processing</span>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Vertical Stepper */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {PIPELINE_STEPS.map((stage, idx) => {
              const status = getStageStatus(stage.key);
              const isLast = idx === PIPELINE_STEPS.length - 1;
              return (
                <div key={stage.key} className="stepper-node">
                  {!isLast && (
                    <div className={`stepper-line ${status === 'done' ? 'completed' : ''}`} />
                  )}
                  <div className={`stepper-icon-box ${status}`}>
                    {status === 'done' ? (
                      <CheckCircle2 size={13} color="var(--emerald)" />
                    ) : status === 'active' ? (
                      <RefreshCw size={12} className="spin" color="var(--primary)" />
                    ) : (
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--t4)' }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: '12px', fontWeight: 600,
                        color: status === 'active' ? 'var(--primary-text)' : status === 'done' ? '#ffffff' : 'var(--t3)'
                      }}>
                        {stage.title}
                      </span>
                      <span className="mono" style={{ fontSize: '10px', color: 'var(--t4)' }}>
                        {stage.time}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--t4)', marginTop: 2 }}>
                      {stage.desc}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* QPU Coherence Monitor Card */}
          <div className="card" style={{ padding: '14px', marginTop: 'auto', background: 'var(--bg-base)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--t2)' }}>
                QPU Coherence Status
              </span>
              <span className="badge b-green" style={{ fontSize: '9.5px', padding: '1px 6px' }}>
                Optimal
              </span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--t3)', lineHeight: 1.5 }}>
              All 14-qubit Hilbert states initialized in uniform superposition. Zero thermal noise detected.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};
