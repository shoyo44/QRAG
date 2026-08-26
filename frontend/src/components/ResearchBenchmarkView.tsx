import { useState } from 'react';
import { AblationView }    from './AblationView';
import { ScalabilityView } from './ScalabilityView';
import { OpenQasmView }    from './OpenQasmView';
import type { ResearchTabKey } from '../types';
import { FlaskConical, Cpu, Binary } from 'lucide-react';

const TABS: { key: ResearchTabKey; label: string; icon: any }[] = [
  { key: 'ablation',    label: 'Ablation Comparison', icon: FlaskConical },
  { key: 'scalability', label: 'Qubit Memory Scaling', icon: Cpu },
  { key: 'openqasm',    label: 'NISQ OpenQASM Circuit', icon: Binary },
];

export function ResearchBenchmarkView() {
  const [tab, setTab] = useState<ResearchTabKey>('ablation');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Unified Compact Studio Header */}
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
        {/* Left: Title + Metric Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 'var(--r-md)',
            background: 'var(--primary-lt)', border: '1px solid #c7d2fe',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FlaskConical size={18} color="var(--primary)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 className="font-headline" style={{ fontSize: '15px', fontWeight: 800, color: 'var(--t1)' }}>
                Benchmark Studio
              </h2>
              <span className="badge b-indigo" style={{ fontSize: '10px', padding: '1px 7px' }}>v2.4</span>
            </div>
            <p style={{ color: 'var(--t3)', fontSize: '11.5px', marginTop: 1 }}>
              Quantitative evaluation suite for quantum-enhanced multi-hop retrieval
            </p>
          </div>

          <div style={{ height: 24, width: 1, background: 'var(--bd)', margin: '0 4px' }} />

          {/* Quick Metrics */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="badge b-indigo" style={{ fontSize: '11px', fontWeight: 600 }}>3 Engines</span>
            <span className="badge b-purple" style={{ fontSize: '11px', fontWeight: 600 }}>14-Q QPU</span>
            <span className="badge b-green" style={{ fontSize: '11px', fontWeight: 600 }}>RAGAS Verified</span>
          </div>
        </div>

        {/* Right: Segmented Switcher */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          border: '1px solid var(--bd)',
          borderRadius: 'var(--r-md)',
          padding: 3,
          gap: 2
        }}>
          {TABS.map((t) => {
            const Icon = t.icon;
            const isCurrent = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px',
                  background: isCurrent ? '#ffffff' : 'transparent',
                  borderRadius: 'var(--r-sm)',
                  border: 'none',
                  color: isCurrent ? 'var(--primary)' : 'var(--t3)',
                  fontFamily: 'var(--font-headline)',
                  fontSize: '12px',
                  fontWeight: isCurrent ? 700 : 500,
                  cursor: 'pointer',
                  boxShadow: isCurrent ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all var(--transition)'
                }}
              >
                <Icon size={13} color={isCurrent ? 'var(--primary)' : 'var(--t4)'} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {tab === 'ablation'    && <AblationView />}
        {tab === 'scalability' && <ScalabilityView />}
        {tab === 'openqasm'    && <OpenQasmView />}
      </div>
    </div>
  );
}
