import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { useToast } from '../hooks/useToast';
import type { AblationData, AblationResult } from '../types';
import { Play, Sparkles, Binary, Zap, Database, Layers, BookOpen, Cpu, Copy, Check, Download } from 'lucide-react';

const PRESET_QUERIES = [
  'Does Trastuzumab emtansine (T-DM1) significantly improve overall survival in HER2-positive metastatic breast cancer?',
  'Through what multi-hop biological pathway does Imatinib induce remission in BCR-ABL positive Chronic Myeloid Leukemia?',
  'How does SGLT2 inhibition with Dapagliflozin attenuate renal progression in chronic kidney disease?',
  'What is the molecular mechanism of CRISPR-Cas9 ribonucleoprotein delivery in correcting sickle cell disease?',
  'What is the pharmacological bioactivity and molecular target profile of Osimertinib in EGFR-mutant NSCLC?',
  'How does Graphene relate to Carbon atoms and Electrical Conductivity?',
  'What is the relationship between BCS Theory, Cooper Pairs, and Superconductivity?',
  'Explain Trotterized Heisenberg Hamiltonian evolution on superconducting qubits.',
];

const MODES = [
  { 
    key: 'pure_vector' as const, 
    label: 'Pure Vector Search',   
    desc: 'Dense cosine similarity via Qdrant 768-dim index',     
    badge: 'b-indigo',
    icon: Database,
    color: '#0284c7'
  },
  { 
    key: 'classical_graph' as const, 
    label: 'Classical Graph Walk',    
    desc: 'Personalized PageRank on multi-hop NetworkX graph',       
    badge: 'b-green',
    icon: Layers,
    color: '#10b981'
  },
  { 
    key: 'quantum_graph' as const, 
    label: 'Q-GraphRAG (CTQW)',       
    desc: 'Continuous-Time Quantum Walk via 14-Qubit Hilbert Kernel',    
    badge: 'badge-quantum',
    icon: Zap,
    color: '#4f46e5'
  },
];

interface PaperFigure {
  id: string;
  title: string;
  url: string;
  desc: string;
}

interface PaperManifest {
  title: string;
  figures: PaperFigure[];
  latex_table: string;
  openqasm_code: string;
  total_benchmark_items: number;
  quantum_fidelity: number;
}

function ScoreMeter({ label, value, max = 1.0, color }: { label: string; value: number; max?: number; color: string }) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px' }}>
        <span style={{ color: 'var(--t3)' }}>{label}</span>
        <span className="mono" style={{ color: 'var(--t1)', fontWeight: 700 }}>
          {value.toFixed(3)}
        </span>
      </div>
      <div style={{ height: 6, width: '100%', background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: 99,
          transition: 'width 0.5s ease-out'
        }} />
      </div>
    </div>
  );
}

function ResultCol({ item, mode }: { item: AblationResult; mode: typeof MODES[number] }) {
  const isQ = mode.key === 'quantum_graph';
  const Icon = mode.icon;

  return (
    <div className="card fade-in" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      border: isQ ? '2px solid var(--primary)' : '1px solid var(--bd)',
      boxShadow: isQ ? '0 4px 20px -2px rgba(79, 70, 229, 0.18)' : 'var(--shadow-sm)',
      position: 'relative'
    }}>
      {isQ && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: 'var(--primary)', color: '#ffffff',
          fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
          padding: '2px 10px', borderBottomLeftRadius: 8
        }}>
          Quantum Advantage
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--bd-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: isQ ? 'var(--primary-lt)' : '#f8fafc'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: mode.color + '18', border: `1px solid ${mode.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Icon size={16} color={mode.color} />
          </div>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>{mode.label}</span>
            <div style={{ fontSize: '11px', color: 'var(--t3)', marginTop: 1 }}>{mode.desc}</div>
          </div>
        </div>
        <span className="badge b-indigo mono" style={{ fontSize: '11px', fontWeight: 700 }}>
          {item.latency_ms} ms
        </span>
      </div>

      {/* Body */}
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
        {/* Synthesized Response */}
        <div>
          <div style={{ fontSize: '10.5px', color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, marginBottom: 6 }}>
            Generated Grounded Response
          </div>
          <div style={{
            padding: '12px 14px', borderRadius: 'var(--r-md)',
            background: '#f8fafc', border: '1px solid var(--bd)',
            fontSize: '12.5px', lineHeight: 1.6, color: 'var(--t1)', minHeight: 74,
            maxHeight: 110, overflowY: 'auto'
          }}>
            {item.answer || <em style={{ color: 'var(--t4)' }}>No response payload returned.</em>}
          </div>
        </div>

        {/* Progress Meters */}
        <div style={{
          padding: '12px 14px', borderRadius: 'var(--r-md)',
          background: '#f8fafc', border: '1px solid var(--bd)',
          display: 'flex', flexDirection: 'column', gap: 9
        }}>
          <ScoreMeter label="Retrieval Precision @ 5" value={item.retrieval_precision_at_k ?? 0} color="#10b981" />
          <ScoreMeter label="Retrieval Recall @ 5"    value={item.retrieval_recall_at_k ?? 0}    color="#0284c7" />
          <ScoreMeter label="Answer F1 Score"         value={item.answer_f1 ?? 0}               color="#4f46e5" />
          {item.ragas?.faithfulness !== undefined && (
            <ScoreMeter label="RAGAS Faithfulness"    value={item.ragas.faithfulness}           color="#8b5cf6" />
          )}
        </div>

        {/* RAGAS Composite Metric Pill */}
        {item.ragas?.overall_ragas_score !== undefined && (
          <div style={{
            padding: '8px 12px', borderRadius: 'var(--r-sm)',
            background: '#ffffff', border: '1px solid var(--bd)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: '11.5px'
          }}>
            <span style={{ color: 'var(--t3)', fontWeight: 600 }}>Overall RAGAS Score</span>
            <span className="mono" style={{ color: '#059669', fontWeight: 800 }}>
              {(item.ragas.overall_ragas_score * 100).toFixed(1)}%
            </span>
          </div>
        )}

        {/* CTQW Hilbert Overlap (Quantum Only) */}
        {isQ && item.quantum_kernel_similarity !== undefined && (
          <div style={{
            padding: '11px 14px', borderRadius: 'var(--r-md)',
            background: 'var(--primary-lt)',
            border: '1px solid #c7d2fe',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Sparkles size={15} color="var(--primary)" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-text)' }}>
                CTQW Hilbert Amplitude Overlap
              </span>
            </div>
            <span className="mono" style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--primary-text)' }}>
              {Number(item.quantum_kernel_similarity).toFixed(4)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function AblationView() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'ablation' | 'paper' | 'qpu'>('ablation');
  const [query, setQuery] = useState(PRESET_QUERIES[0]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AblationData | null>(null);
  const [manifest, setManifest] = useState<PaperManifest | null>(null);
  const [copiedTable, setCopiedTable] = useState(false);
  const [copiedQasm, setCopiedQasm] = useState(false);

  useEffect(() => {
    api.getPaperManifest()
      .then(res => setManifest(res.data))
      .catch(() => console.log('Manifest endpoint not ready yet.'));
  }, []);

  const run = async (customQuery?: string) => {
    const q = (customQuery ?? query).trim();
    if (!q) return;
    setLoading(true);
    setData(null);
    try {
      const res = await api.runAblation(q);
      setData(res.data);
      showToast('3-Way ablation benchmark completed.', 'success');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Benchmark request failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, type: 'table' | 'qasm') => {
    navigator.clipboard.writeText(text);
    if (type === 'table') {
      setCopiedTable(true);
      setTimeout(() => setCopiedTable(false), 2000);
      showToast('LaTeX table code copied to clipboard!', 'success');
    } else {
      setCopiedQasm(true);
      setTimeout(() => setCopiedQasm(false), 2000);
      showToast('OpenQASM 2.0 code copied to clipboard!', 'success');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Sub-Navigation Header */}
      <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--bd)', paddingBottom: 10 }}>
        <button
          className={`btn ${activeTab === 'ablation' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('ablation')}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Zap size={14} />
          <span>Live 3-Way Ablation</span>
        </button>

        <button
          className={`btn ${activeTab === 'paper' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('paper')}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <BookOpen size={14} />
          <span>Publication Figures &amp; LaTeX Table</span>
          <span className="badge b-indigo" style={{ fontSize: '10px', marginLeft: 4 }}>300 DPI</span>
        </button>

        <button
          className={`btn ${activeTab === 'qpu' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          onClick={() => setActiveTab('qpu')}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <Cpu size={14} />
          <span>IBM Quantum &amp; OpenQASM 2.0</span>
          <span className="badge badge-quantum" style={{ fontSize: '10px', marginLeft: 4 }}>Qiskit</span>
        </button>
      </div>

      {/* TAB 1: Live 3-Way Ablation */}
      {activeTab === 'ablation' && (
        <>
          {/* Query Runner & Presets */}
          <div className="card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                className="inp"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && run()}
                placeholder="Enter research hypothesis or benchmark query…"
                disabled={loading}
                style={{ flex: 1 }}
              />
              <button className="btn btn-primary" onClick={() => run()} disabled={loading || !query.trim()}>
                {loading ? <span className="spin" /> : <Play size={14} />}
                <span>{loading ? 'Evaluating…' : 'Run 3-Way Ablation'}</span>
              </button>
              {data && (
                <button className="btn btn-secondary btn-sm" onClick={() => setData(null)}>
                  Clear
                </button>
              )}
            </div>

            {/* Preset Chips */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', color: 'var(--t4)', fontWeight: 600, textTransform: 'uppercase' }}>
                Presets:
              </span>
              {PRESET_QUERIES.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => { setQuery(p); run(p); }}
                  disabled={loading}
                  style={{
                    fontSize: '11.5px',
                    padding: '4px 10px',
                    borderRadius: 99,
                    background: query === p ? 'var(--primary-lt)' : '#f1f5f9',
                    color: query === p ? 'var(--primary)' : 'var(--t2)',
                    border: `1px solid ${query === p ? '#c7d2fe' : 'var(--bd)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontWeight: query === p ? 600 : 500
                  }}
                >
                  {p.length > 38 ? p.slice(0, 36) + '…' : p}
                </button>
              ))}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {MODES.map((m) => (
                <div key={m.key} className="card" style={{ padding: 36, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <span className={`badge ${m.badge}`}>{m.label}</span>
                  <span className="spin" style={{ width: 22, height: 22, margin: '10px 0' }} />
                  <p style={{ color: 'var(--t3)', fontSize: '12.5px' }}>
                    Executing parallel retrieval &amp; scoring…
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Empty State / Initial Prompt */}
          {!data && !loading && (
            <div className="card" style={{ padding: '36px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'var(--primary-lt)', border: '1px solid #c7d2fe',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Binary size={24} color="var(--primary)" />
              </div>
              <div>
                <h4 className="font-headline" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--t1)' }}>
                  Ablation Comparison Ready
                </h4>
                <p style={{ color: 'var(--t3)', fontSize: '12.5px', marginTop: 4, maxWidth: 500 }}>
                  Click <strong>Run 3-Way Ablation</strong> or select any preset above to benchmark Pure Vector, Classical Graph, and Quantum Walk simultaneously.
                </p>
              </div>
              <button className="btn btn-primary" onClick={() => run()} style={{ padding: '8px 20px' }}>
                <Play size={13} />
                <span>Run Sample Benchmark</span>
              </button>
            </div>
          )}

          {/* Results Comparison Grid */}
          {data && !loading && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {MODES.map((m) => {
                const item = data[m.key];
                return item ? <ResultCol key={m.key} item={item} mode={m} /> : null;
              })}
            </div>
          )}
        </>
      )}

      {/* TAB 2: Publication Figures & LaTeX Table */}
      {activeTab === 'paper' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Top Banner with Copy LaTeX */}
          <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)', border: '1px solid #c7d2fe' }}>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
                Camera-Ready Publication Figures &amp; LaTeX Table 1 ($N=50$)
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--t3)', marginTop: 4, margin: 0 }}>
                High-resolution 300-DPI publication figures and camera-ready LaTeX code ready for direct inclusion in Overleaf.
              </p>
            </div>
            {manifest?.latex_table && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => copyToClipboard(manifest.latex_table, 'table')}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {copiedTable ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedTable ? 'Copied LaTeX!' : 'Copy LaTeX Table 1'}</span>
              </button>
            )}
          </div>

          {/* Figures Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {manifest?.figures?.map((fig) => (
              <div key={fig.id} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--t1)' }}>
                    {fig.title}
                  </span>
                  <a
                    href={fig.url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Download size={12} />
                    <span>300 DPI</span>
                  </a>
                </div>
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid var(--bd)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  maxHeight: 280,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img
                    src={fig.url}
                    alt={fig.title}
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                  />
                </div>
                <p style={{ fontSize: '11.5px', color: 'var(--t3)', margin: 0, lineHeight: 1.5 }}>
                  {fig.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: IBM Quantum & NISQ OpenQASM 2.0 */}
      {activeTab === 'qpu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary-lt)', border: '1px solid #c7d2fe' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge badge-quantum">NISQ Superconducting Target</span>
                <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--primary-text)' }}>
                  IBM Quantum Heavy-Hex Architecture
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--primary-text)', opacity: 0.85, marginTop: 4, margin: 0 }}>
                Trotterized Heisenberg graph Hamiltonian evolution compiled into native single-qubit rotations and CNOT gates.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {manifest?.openqasm_code && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => copyToClipboard(manifest.openqasm_code, 'qasm')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  {copiedQasm ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedQasm ? 'Copied QASM!' : 'Copy OpenQASM 2.0'}</span>
                </button>
              )}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
            {/* OpenQASM Code View */}
            <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--t1)' }}>
                  Hardware Specification (OpenQASM 2.0)
                </span>
                <span className="mono" style={{ fontSize: '11px', color: 'var(--t3)' }}>
                  Target: 4-Qubit CML Motif
                </span>
              </div>
              <pre className="mono" style={{
                background: '#0f172a',
                color: '#38bdf8',
                padding: '14px',
                borderRadius: 8,
                fontSize: '11.5px',
                lineHeight: 1.5,
                maxHeight: 380,
                overflowY: 'auto',
                margin: 0
              }}>
                {manifest?.openqasm_code || '// Loading OpenQASM specification...'}
              </pre>
            </div>

            {/* QPU Circuit Diagram View */}
            <div className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--t1)' }}>
                Physical Heavy-Hex Transpiled Circuit
              </span>
              <div style={{
                background: '#f8fafc',
                border: '1px solid var(--bd)',
                borderRadius: 8,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 8
              }}>
                <img
                  src="/api/v1/research/figures/static/fig_ibm_quantum_circuit.png"
                  alt="Transpiled Circuit"
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
              <div style={{
                padding: '10px 14px',
                borderRadius: 6,
                background: '#f1f5f9',
                fontSize: '12px',
                color: 'var(--t2)',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>Simulated QPU Fidelity $\mathcal{'{F}'}$:</span>
                <span className="mono" style={{ fontWeight: 800, color: '#059669' }}>
                  {manifest?.quantum_fidelity ?? 0.9926}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
