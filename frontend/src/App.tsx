import { useState } from 'react';
import { 
  Home,
  MessageSquare, 
  Network, 
  FileText, 
  BarChart2, 
  History, 
  FlaskConical, 
  Cpu, 
  ChevronRight,
  ShieldCheck,
  LogIn,
  LogOut,
  Zap,
  ArrowLeft
} from 'lucide-react';
import { QuantumChat }           from './components/QuantumChat';
import { GraphExplorer }         from './components/GraphExplorer';
import { DocumentManager }       from './components/DocumentManager';
import { AnalyticsView }         from './components/AnalyticsView';
import { HistoryView }           from './components/HistoryView';
import { ResearchBenchmarkView } from './components/ResearchBenchmarkView';
import { HomePage }              from './components/HomePage';
import { LoginPage }             from './components/LoginPage';
import { ToastProvider, useToast } from './hooks/useToast';
import { useHealth }             from './hooks/useHealth';
import { AuthProvider, useAuth } from './context/AuthContext';
import type { TabKey }           from './types';

const WORKSPACE_NAV_ITEMS: { key: TabKey; label: string; icon: any; badge?: string }[] = [
  { key: 'chat',      label: 'Chat Workspace',       icon: MessageSquare, badge: 'CTQW' },
  { key: 'graph',     label: 'Knowledge Graph',      icon: Network },
  { key: 'documents', label: 'Documents & Data',     icon: FileText },
  { key: 'research',  label: 'Research Benchmarks',  icon: FlaskConical },
  { key: 'analytics', label: 'Analytics',            icon: BarChart2 },
  { key: 'history',   label: 'Session History',      icon: History },
];

function MainLayout() {
  const [tab, setTab] = useState<TabKey>('home');
  const [retrievalEngine, setRetrievalEngine] = useState<'ctqw' | 'pagerank' | 'vector'>('ctqw');
  const [inspectSubgraph, setInspectSubgraph] = useState<any>(null);
  const { health }    = useHealth();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const handleInspectGraph = (subgraph: any) => {
    setInspectSubgraph(subgraph);
    setTab('graph');
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Signed out successfully.', 'info');
      setTab('home');
    } catch {
      showToast('Error signing out.', 'error');
    }
  };

  const isOnline = health?.status === 'online' || health?.status === 'healthy' || health?.status === 'ok';

  // 1. FULL-SCREEN HOME / LANDING VIEW
  if (tab === 'home') {
    return <HomePage onNavigate={(t) => setTab(t)} />;
  }

  // 2. FULL-SCREEN LOGIN / AUTH VIEW
  if (tab === 'login') {
    return (
      <div style={{ position: 'relative' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setTab('home')}
          style={{
            position: 'absolute',
            top: 20,
            left: 24,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Landing Page</span>
        </button>
        <LoginPage onAuthSuccess={() => setTab('chat')} />
      </div>
    );
  }

  // 3. INTERNAL WORKSPACE DASHBOARD VIEW (With Left Sidebar)
  return (
    <div className="app-shell">
      {/* Left Sidebar */}
      <aside className="sidebar">
        {/* Brand Header */}
        <div className="sidebar-brand" onClick={() => setTab('home')} style={{ cursor: 'pointer' }} title="Click to return to Landing Page">
          <div className="sidebar-logo-mark">
            <Zap size={18} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span className="font-headline" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--t1)' }}>
                Q-GraphRAG
              </span>
              <span className="badge b-indigo" style={{ padding: '1px 6px', fontSize: '9px' }}>v2.4</span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--t3)' }}>
              Hybrid Quantum Intelligence
            </span>
          </div>
        </div>

        {/* Back to Home Button */}
        <div style={{ padding: '0 12px 6px' }}>
          <button
            className="sidebar-link"
            onClick={() => setTab('home')}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--bd-subtle)',
              fontSize: '12px',
              color: 'var(--primary)',
              fontWeight: 600
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <div style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--t4)', padding: '6px 12px 4px', fontWeight: 600 }}>
            Workspace Navigation
          </div>
          {WORKSPACE_NAV_ITEMS.map(({ key, label, icon: Icon, badge }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                id={`nav-${key}`}
                className={`sidebar-link${active ? ' active' : ''}`}
                onClick={() => setTab(key)}
              >
                <Icon size={16} className="sidebar-icon" />
                <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
                {badge && (
                  <span className="badge b-indigo" style={{ fontSize: '9.5px', padding: '1px 6px' }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Account / Auth Widget */}
        <div style={{ padding: '0 12px', marginTop: 'auto', marginBottom: 12 }}>
          {user ? (
            <div style={{
              padding: '10px 12px',
              borderRadius: 12,
              background: 'var(--bg-base)',
              border: '1px solid var(--bd)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 99,
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  color: '#ffffff', fontSize: '11px', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {user.isAnonymous ? 'G' : (user.email ? user.email[0].toUpperCase() : 'U')}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--t1)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {user.isAnonymous ? 'Guest Researcher' : user.displayName || user.email?.split('@')[0] || 'User'}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--t3)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {user.isAnonymous ? 'Demo Session' : user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                title="Sign Out"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--t3)',
                  cursor: 'pointer',
                  padding: 4,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setTab('login')}
              style={{
                width: '100%',
                padding: '9px',
                borderRadius: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <LogIn size={14} />
              <span>Sign In / Sign Up</span>
            </button>
          )}
        </div>

        {/* Sidebar Footer: System Status */}
        <div className="sidebar-footer">
          <div className="qpu-status-widget">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Cpu size={14} color="#a5b4fc" />
                <span style={{ fontSize: '11.5px', fontWeight: 600, color: '#e0e7ff' }}>
                  Quantum Engine
                </span>
              </div>
              <span className={`dot ${isOnline ? 'dot-green' : 'dot-amber'}`} />
            </div>

            <div style={{ fontSize: '11px', color: '#a5b4fc', display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Simulator:</span>
                <span className="mono" style={{ color: '#ffffff' }}>PennyLane 14-Q</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Knowledge Base:</span>
                <span style={{ color: '#ffffff' }}>{health?.local_graph_nodes ?? 128} Nodes</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Health:</span>
                <span style={{ color: isOnline ? '#34d399' : '#fbbf24' }}>
                  {isOnline ? 'Active & Ready' : 'Connecting…'}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px', fontSize: '11px', color: 'var(--t3)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <ShieldCheck size={12} color="var(--emerald)" /> MongoDB Atlas &amp; Firebase
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* Top Header Bar */}
        <header className="top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="font-headline" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--t1)' }}>
              {WORKSPACE_NAV_ITEMS.find(n => n.key === tab)?.label || 'Workspace'}
            </span>
            <ChevronRight size={14} color="var(--t4)" />
            <div className="engine-pill-group">
              <button 
                className={`engine-pill ${retrievalEngine === 'ctqw' ? 'active' : ''}`}
                onClick={() => setRetrievalEngine('ctqw')}
              >
                Quantum Walk (CTQW)
              </button>
              <button 
                className={`engine-pill ${retrievalEngine === 'pagerank' ? 'active' : ''}`}
                onClick={() => setRetrievalEngine('pagerank')}
              >
                Graph PageRank
              </button>
              <button 
                className={`engine-pill ${retrievalEngine === 'vector' ? 'active' : ''}`}
                onClick={() => setRetrievalEngine('vector')}
              >
                Dense Vector
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setTab('home')}
              style={{ display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <Home size={13} />
              <span>Landing Page</span>
            </button>

            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="badge b-indigo" style={{ fontSize: '11px' }}>
                  {user.isAnonymous ? 'Guest' : user.email}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleLogout}
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setTab('login')}
                style={{ display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <LogIn size={13} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Body Canvas */}
        <main style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {tab === 'chat'      && <QuantumChat onInspectGraph={handleInspectGraph} />}
          {tab === 'graph'     && <GraphExplorer initialSubgraph={inspectSubgraph} />}
          {tab === 'documents' && <DocumentManager />}
          {tab === 'research'  && <ResearchBenchmarkView />}
          {tab === 'analytics' && <AnalyticsView />}
          {tab === 'history'   && <HistoryView />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <MainLayout />
      </ToastProvider>
    </AuthProvider>
  );
}
