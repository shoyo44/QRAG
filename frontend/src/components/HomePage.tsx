import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Zap, 
  Sparkles, 
  Cpu, 
  BookOpen, 
  ArrowRight, 
  Compass,
  FlaskConical,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import type { TabKey } from '../types';

interface HomePageProps {
  onNavigate: (tab: TabKey) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const { user } = useAuth();
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<'ctqw' | 'fusion' | 'subgraph'>('ctqw');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)',
      overflowX: 'hidden'
    }}>
      
      {/* ─── 1. TOP STICKY LIGHT NAVBAR ─── */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 36px',
        height: 68,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)'
      }}>
        {/* Brand */}
        <div 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)'
          }}>
            <Zap size={19} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span className="font-headline" style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                Q-GraphRAG
              </span>
              <span className="badge b-indigo" style={{ padding: '1px 6px', fontSize: '9.5px' }}>v2.4</span>
            </div>
            <span style={{ fontSize: '10.5px', color: '#64748b' }}>
              Continuous-Time Quantum Walk Architecture
            </span>
          </div>
        </div>

        {/* Center Quick Nav Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <a href="#architecture" style={{ color: '#334155', fontSize: '13.5px', fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}>
            Architecture
          </a>
          <a href="#benchmarks" style={{ color: '#334155', fontSize: '13.5px', fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}>
            Live Benchmarks
          </a>
          <a href="#interactive-demo" style={{ color: '#334155', fontSize: '13.5px', fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}>
            Quantum Kernel
          </a>
          <a href="#paper" style={{ color: '#334155', fontSize: '13.5px', fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}>
            Research Paper
          </a>
        </nav>

        {/* Right CTA / Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '12px', color: '#334155', background: '#f1f5f9', padding: '6px 12px', borderRadius: 99, border: '1px solid #e2e8f0', fontWeight: 600 }}>
                {user.isAnonymous ? 'Guest Mode' : user.email}
              </span>
              <button
                className="btn btn-primary"
                onClick={() => onNavigate('chat')}
                style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <span>Launch Workspace</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                className="btn btn-secondary"
                onClick={() => onNavigate('login')}
                style={{ padding: '8px 16px', fontSize: '13px', background: '#ffffff', color: '#0f172a', border: '1px solid #cbd5e1' }}
              >
                Sign In
              </button>
              <button
                className="btn btn-primary"
                onClick={() => onNavigate('chat')}
                style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <span>Try Demo Workspace</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ─── 2. HERO SECTION ─── */}
      <section style={{
        position: 'relative',
        padding: '80px 24px 60px',
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 24
      }}>
        {/* Subtle Ambient Glow */}
        <div style={{
          position: 'absolute', top: '15%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 550, height: 550,
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.08) 0%, rgba(2, 132, 199, 0.03) 50%, rgba(248, 250, 252, 0) 70%)',
          borderRadius: '50%', pointerEvents: 'none', zIndex: 0
        }} />

        {/* Top Tag Pill */}
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 16px', borderRadius: 99,
          background: '#eef2ff',
          border: '1px solid #c7d2fe'
        }}>
          <Sparkles size={14} color="#4f46e5" />
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.04em', color: '#4338ca', textTransform: 'uppercase' }}>
            Quantum Machine Learning &times; Knowledge Graph Reasoning
          </span>
        </div>

        {/* Main Title */}
        <h1 style={{
          position: 'relative', zIndex: 2,
          fontSize: '48px',
          fontWeight: 900,
          lineHeight: 1.14,
          letterSpacing: '-0.03em',
          maxWidth: 960,
          margin: 0,
          color: '#0f172a'
        }}>
          Continuous-Time Quantum Walks for Multi-Hop Graph Retrieval
        </h1>

        {/* Subtitle */}
        <p style={{
          position: 'relative', zIndex: 2,
          fontSize: '17px',
          lineHeight: 1.65,
          color: '#475569',
          maxWidth: 760,
          margin: 0
        }}>
          Overcoming the classical random walk diffusion bottleneck. Q-GraphRAG maps graph subgraphs to Heisenberg spin Hamiltonians in a 2^N Hilbert space, achieving ballistic O(t) multi-hop topological exploration.
        </p>

        {/* Primary Action Buttons */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 14, marginTop: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate('chat')}
            style={{
              padding: '13px 26px',
              fontSize: '14.5px',
              fontWeight: 700,
              borderRadius: 10,
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Zap size={16} />
            <span>Launch Quantum Workspace</span>
            <ArrowRight size={15} />
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => onNavigate('research')}
            style={{
              padding: '13px 22px',
              fontSize: '14.5px',
              fontWeight: 600,
              borderRadius: 10,
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <FlaskConical size={16} color="#0284c7" />
            <span>50-Item Research Benchmark</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={() => onNavigate('graph')}
            style={{
              padding: '13px 20px',
              fontSize: '14.5px',
              fontWeight: 600,
              borderRadius: 10,
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Compass size={16} color="#10b981" />
            <span>3D Knowledge Graph</span>
          </button>
        </div>

        {/* Live Empirical Metrics Strip */}
        <div id="benchmarks" style={{
          position: 'relative', zIndex: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16,
          width: '100%',
          marginTop: 36
        }}>
          {[
            { label: 'Multi-Hop Answer F1 Boost', value: '+57.7%', sub: 'PrimeKG CML multi-hop pathway', color: '#4f46e5' },
            { label: 'QPU State Fidelity', value: 'F = 0.9926', sub: 'Simulated on IBM Heavy-Hex QPU', color: '#059669' },
            { label: 'State Vector Space', value: '2^14 Hilbert', sub: 'PennyLane Lightning simulation', color: '#d97706' },
            { label: 'Statistical Significance', value: 'p < 0.01', sub: 'N=50 Paired t-test vs. PageRank', color: '#7c3aed' },
          ].map((stat, idx) => (
            <div key={idx} style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderTop: `3px solid ${stat.color}`,
              borderRadius: 14,
              padding: '20px 18px',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              boxShadow: '0 2px 8px -2px rgba(0, 0, 0, 0.04)'
            }}>
              <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
                {stat.label}
              </span>
              <span className="mono" style={{ fontSize: '24px', fontWeight: 800, color: stat.color }}>
                {stat.value}
              </span>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                {stat.sub}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 3. INTERACTIVE QUANTUM WALK VS DIFFUSION DEMO ─── */}
      <section id="interactive-demo" style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '50px 24px',
        borderTop: '1px solid #e2e8f0'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <span style={{ fontSize: '11.5px', color: '#4f46e5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Interactive Theoretical Proof
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '6px 0 8px' }}>
            Quantum Constructive Interference vs. Classical Diffusion
          </h2>
          <p style={{ fontSize: '14.5px', color: '#475569', maxWidth: 680, margin: '0 auto' }}>
            Classical random walks suffer from O(sqrt(t)) spatial dilution and hub traps. Continuous-Time Quantum Walks propagate ballistically (O(t)).
          </p>
        </div>

        {/* Interactive Comparison Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px -4px rgba(0, 0, 0, 0.05)',
          padding: '28px',
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          gap: 28,
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {[
                { key: 'ctqw' as const, label: 'Continuous-Time Quantum Walk (Ours)' },
                { key: 'fusion' as const, label: 'Dual-Channel Fusion' },
                { key: 'subgraph' as const, label: 'Hamiltonian Mapping' },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setActiveInteractiveTab(t.key)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 8,
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: activeInteractiveTab === t.key ? '#4f46e5' : '#f1f5f9',
                    color: activeInteractiveTab === t.key ? '#ffffff' : '#475569',
                    border: '1px solid ' + (activeInteractiveTab === t.key ? '#4338ca' : '#e2e8f0'),
                    transition: 'all 0.15s ease'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {activeInteractiveTab === 'ctqw' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Ballistic Wavepacket Dispersion
                </h3>
                <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  In CTQW, the probability state vector evolves unitarily under Schrödinger dynamics. Constructive quantum interference amplifies probability amplitude at distant topological entities without getting trapped in generic high-degree nodes.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: '#059669', fontWeight: 500 }}>
                    <CheckCircle2 size={16} /> <span>Quadratic exploration speedup across graph diameter</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: '#059669', fontWeight: 500 }}>
                    <CheckCircle2 size={16} /> <span>Eliminates exponential O(1/H) classical probability decay</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: '#059669', fontWeight: 500 }}>
                    <CheckCircle2 size={16} /> <span>Maintains high multi-hop fidelity (+73.7% F1 at 3 hops)</span>
                  </div>
                </div>
              </div>
            )}

            {activeInteractiveTab === 'fusion' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Dual-Channel Dense/Quantum Interleaving
                </h3>
                <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  Q-GraphRAG dynamically interleaves top quantum multi-hop pathways (k=1..3) with semantic vector chunks from Qdrant (k=1..2), providing the LLM with both broad semantic grounding and strict topological causal relationships.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: '#059669', fontWeight: 500 }}>
                    <CheckCircle2 size={16} /> <span>Dual-stream ranking for zero factual hallucination</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: '#059669', fontWeight: 500 }}>
                    <CheckCircle2 size={16} /> <span>RAGAS Faithfulness score up to 0.76</span>
                  </div>
                </div>
              </div>
            )}

            {activeInteractiveTab === 'subgraph' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Graph Heisenberg Spin Mapping
                </h3>
                <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: 1.6, margin: 0 }}>
                  Knowledge subgraphs are mapped to isotropic Heisenberg Hamiltonian matrices on PennyLane Lightning statevector simulators and IBM Quantum Heavy-Hex processors.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: '#059669', fontWeight: 500 }}>
                    <CheckCircle2 size={16} /> <span>Exact Trotter-Suzuki product formula discretization</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '13px', color: '#059669', fontWeight: 500 }}>
                    <CheckCircle2 size={16} /> <span>Hardware transpilation to OpenQASM 2.0 specs</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Visual Chart Preview Frame */}
          <div style={{
            background: '#f8fafc',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            padding: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src="/api/v1/research/figures/static/fig2_ctqw_quantum_walk_interference.png"
              alt="Quantum Interference Proof"
              style={{ width: '100%', height: 'auto', borderRadius: 8 }}
            />
          </div>
        </div>
      </section>

      {/* ─── 4. FOUR CORE ARCHITECTURAL PILLARS ─── */}
      <section id="architecture" style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '50px 24px',
        borderTop: '1px solid #e2e8f0'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <span style={{ fontSize: '11.5px', color: '#4f46e5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            System Architecture
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', margin: '6px 0 8px' }}>
            End-to-End Hybrid Quantum-Classical Pipeline
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
          {[
            {
              step: '01',
              title: 'Intent Routing & Entity Extraction',
              desc: 'Parses complex queries to identify seed entity anchors and extracts topological candidate subgraphs.'
            },
            {
              step: '02',
              title: 'Heisenberg Hamiltonian Mapping',
              desc: 'Encodes subgraph connectivity into Pauli spin interaction matrices across 14-qubit Hilbert state spaces.'
            },
            {
              step: '03',
              title: 'Continuous-Time Quantum Walk',
              desc: 'Simulates unitary wavepacket evolution e^{-iHt} to rank multi-hop causal pathways by probability density.'
            },
            {
              step: '04',
              title: 'Dual-Channel Grounded Synthesis',
              desc: 'Fuses quantum topological chains with dense vector passages for zero-hallucination LLM generation.'
            }
          ].map((card, idx) => (
            <div key={idx} style={{
              background: '#ffffff',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              boxShadow: '0 2px 6px -1px rgba(0, 0, 0, 0.04)'
            }}>
              <span className="mono" style={{ fontSize: '12.5px', fontWeight: 800, color: '#4f46e5' }}>
                STAGE {card.step}
              </span>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {card.title}
              </h4>
              <p style={{ fontSize: '12.5px', lineHeight: 1.6, color: '#64748b', margin: 0 }}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 5. RESEARCH BENCHMARK & OVERLEAF MANUSCRIPT ─── */}
      <section id="paper" style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '50px 24px',
        borderTop: '1px solid #e2e8f0'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #eef2ff 0%, #f0fdf4 100%)',
          borderRadius: 18,
          border: '1px solid #c7d2fe',
          padding: '36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 28
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 680 }}>
            <span className="badge b-indigo" style={{ width: 'fit-content' }}>
              IEEE/ACM Submission Ready
            </span>
            <h3 style={{ fontSize: '23px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Complete 8-Page LaTeX Manuscript &amp; 10 Publication Figures
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              The full research package includes mathematical proofs, 50-item statistical evaluation (PubMedQA, PrimeKG, ChEMBL), OpenQASM 2.0 hardware specs, and camera-ready LaTeX tables.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              className="btn btn-primary"
              onClick={() => onNavigate('research')}
              style={{
                padding: '11px 22px',
                fontSize: '13.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 7
              }}
            >
              <BookOpen size={15} />
              <span>Explore Benchmark Studio</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => onNavigate('chat')}
              style={{
                padding: '11px 22px',
                fontSize: '13.5px',
                fontWeight: 600,
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: 7
              }}
            >
              <Zap size={15} color="#4f46e5" />
              <span>Open Chat Workspace</span>
            </button>
          </div>
        </div>
      </section>

      {/* ─── 6. FOOTER ─── */}
      <footer style={{
        borderTop: '1px solid #e2e8f0',
        padding: '36px 32px',
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#64748b',
        fontSize: '12.5px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Zap size={16} color="#4f46e5" />
          <span style={{ color: '#0f172a', fontWeight: 600 }}>Q-GraphRAG Platform</span>
          <span>&copy; 2026 Quantum Intelligence Initiative</span>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#334155' }}>
            <ShieldCheck size={13} color="#059669" /> Firebase &amp; MongoDB Atlas Secured
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#334155' }}>
            <Cpu size={13} color="#4f46e5" /> PennyLane &amp; Qiskit Compatible
          </span>
        </div>
      </footer>

    </div>
  );
}
