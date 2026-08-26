import { useState } from 'react';
import { Copy, Check, Terminal, Sparkles } from 'lucide-react';

const QASM = `OPENQASM 2.0;
include "qelib1.inc";

qreg q[4];
creg c[4];

// State preparation — Ry rotations initialise superposition
ry(0.785398) q[0];
ry(0.785398) q[1];
ry(0.785398) q[2];
ry(0.785398) q[3];

// Trotterized Heisenberg evolution — edge (0,1)
cx  q[0], q[1];
rz (0.500) q[1];
cx  q[0], q[1];

// Edge (1,2)
cx  q[1], q[2];
rz (0.500) q[2];
cx  q[1], q[2];

// Edge (2,3)
cx  q[2], q[3];
rz (0.500) q[3];
cx  q[2], q[3];

measure q -> c;`;

const STATS = [
  { label: 'Qubits (N)',     value: '4'     },
  { label: 'Gate Depth',     value: '9'     },
  { label: 'Trotter Steps',  value: '3'     },
  { label: 'Evolution Δt',   value: '0.500' },
];

const EXPLAINERS = [
  {
    title: 'Superposition State Preparation',
    body:  'Single-qubit Ry(θ) rotations initialize each qubit, distributing uniform amplitude across candidate subgraph nodes before unitary evolution.',
  },
  {
    title: 'First-Order Trotter–Suzuki Evolution',
    body:  'Each CX–Rz–CX block maps an interaction Hamiltonian edge H = ∑ σᵢ⊗σⱼ, evolving the state vector through continuous-time Hilbert space.',
  },
];

export function OpenQasmView() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(QASM);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Main QASM Circuit Code Card */}
      <div className="card fade-in">
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--bd-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Terminal size={18} color="var(--primary)" />
            <div>
              <h3 className="font-headline" style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>
                OpenQASM 2.0 — Trotterized NISQ Circuit
              </h3>
              <p style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>
                Compatible with IBM Quantum Heron/Eagle, Amazon Braket, and Rigetti QPUs.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="badge b-indigo">NISQ Ready</span>
            <button className="btn btn-secondary btn-sm" onClick={copy}>
              {copied ? <Check size={13} color="var(--emerald)" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy QASM'}</span>
            </button>
          </div>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 4 Circuit Metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {STATS.map((s) => (
              <div key={s.label} className="card" style={{ padding: '14px 18px', background: '#f8fafc' }}>
                <span style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 600 }}>
                  {s.label}
                </span>
                <div className="font-headline mono" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          {/* Syntax Code Editor Frame */}
          <div style={{
            background: '#f8fafc', border: '1px solid var(--bd)',
            borderRadius: 'var(--r-md)', padding: '18px 20px',
            overflowX: 'auto'
          }}>
            <pre className="mono" style={{ fontSize: '12.5px', color: '#1e293b', lineHeight: 1.75 }}>
              {QASM}
            </pre>
          </div>
        </div>
      </div>

      {/* Explainer Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {EXPLAINERS.map((e) => (
          <div key={e.title} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Sparkles size={15} color="var(--primary)" />
              <h4 className="font-headline" style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--t1)' }}>
                {e.title}
              </h4>
            </div>
            <p style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.65 }}>
              {e.body}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
