import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ForceGraph3D from 'react-force-graph-3d';
import ForceGraph2D from 'react-force-graph-2d';
import * as THREE from 'three';
import {
  Search, RotateCcw, Layers, Box, Target, Play, Pause, ZoomIn, ZoomOut, Compass, Zap, Maximize
} from 'lucide-react';

interface GraphExplorerProps {
  initialSubgraph?: any;
}

const CATEGORIES = [
  { key: 'all',     label: 'All Entities'       },
  { key: 'core',    label: 'Core Architecture'  },
  { key: 'physics', label: 'Quantum Physics'    },
  { key: 'storage', label: 'Storage & DB'       },
  { key: 'ai',      label: 'AI & Models'        },
];

const DEFAULT_NODES = [
  { id: 'Quantum Kernel',            name: 'Quantum Kernel',            val: 14, type: 'core',    theta: '0.785', desc: 'Core PennyLane CTQW simulator engine' },
  { id: 'Heisenberg Hamiltonian',    name: 'Heisenberg Hamiltonian',    val: 11, type: 'physics',  theta: '1.240', desc: 'XY Interaction Hamiltonian matrix modelling graph topology' },
  { id: 'PennyLane Simulator',       name: 'PennyLane Simulator',       val: 12, type: 'core',    theta: '0.523', desc: '14-qubit state-vector evolution execution environment' },
  { id: 'NetworkX Graph Store',      name: 'NetworkX Graph Store',      val: 11, type: 'storage',  theta: '1.047', desc: 'In-memory multi-hop relational adjacency storage' },
  { id: 'Qdrant Vector DB',          name: 'Qdrant Vector DB',          val: 10, type: 'storage',  theta: '0.912', desc: '768-dim dense embedding vector store & cosine index' },
  { id: 'Cloudflare Workers AI',     name: 'Cloudflare Workers AI',     val: 10, type: 'ai',      theta: '1.414', desc: 'Grounded LLM synthesis & structured triplet reasoning' },
  { id: 'Nomic Embeddings',          name: 'Nomic Embeddings',          val: 9,  type: 'storage',  theta: '0.628', desc: 'nomic-embed-text-v1.5 embedding generator' },
  { id: 'Hilbert Space Overlap',     name: 'Hilbert Space Overlap',     val: 11, type: 'physics',  theta: '1.570', desc: 'Inner product |⟨ψ_q|ψ_G⟩|² amplitude calculator' },
  { id: 'Trotter Unitary Evolution', name: 'Trotter Unitary Evolution', val: 11, type: 'physics',  theta: '0.850', desc: 'First-order Trotter-Suzuki decomposition e^{-iHt}' },
  { id: 'Biomedical Resistance Gene',name: 'Biomedical Resistance Gene',val: 9,  type: 'physics',  theta: '1.110', desc: 'Multi-hop biomedical entity anchor in knowledge graph' },
  { id: 'Superconducting Pathway',   name: 'Superconducting Pathway',   val: 10, type: 'physics',  theta: '0.420', desc: 'Physical NISQ hardware topology mapping' },
];

const DEFAULT_LINKS = [
  { source: 'Quantum Kernel',           target: 'Heisenberg Hamiltonian',    label: 'MODELS' },
  { source: 'Quantum Kernel',           target: 'PennyLane Simulator',        label: 'EXECUTES_ON' },
  { source: 'NetworkX Graph Store',     target: 'Quantum Kernel',             label: 'FEEDS_SUBGRAPH' },
  { source: 'Qdrant Vector DB',         target: 'Nomic Embeddings',           label: 'INDEXES_VECTORS' },
  { source: 'Cloudflare Workers AI',    target: 'Quantum Kernel',             label: 'SYNTHESIZES' },
  { source: 'Quantum Kernel',           target: 'Hilbert Space Overlap',      label: 'CALCULATES' },
  { source: 'Heisenberg Hamiltonian',   target: 'Trotter Unitary Evolution',  label: 'EVOLVES_VIA' },
  { source: 'Trotter Unitary Evolution',target: 'Superconducting Pathway',    label: 'MAPS_TO' },
  { source: 'NetworkX Graph Store',     target: 'Biomedical Resistance Gene', label: 'CONTAINS' },
];

const TYPE_COLOR: Record<string, number> = { core: 0x4f46e5, physics: 0x8b5cf6, storage: 0x0284c7, ai: 0x10b981 };
const TYPE_HEX:   Record<string, string> = { core: '#4f46e5', physics: '#8b5cf6', storage: '#0284c7', ai: '#10b981' };

/** Compute the degree (connection count) of every node */
function computeDegrees(nodes: any[], links: any[]): Record<string, number> {
  const deg: Record<string, number> = {};
  nodes.forEach(n => { deg[n.id] = 0; });
  links.forEach(l => {
    const src = typeof l.source === 'object' ? l.source.id : l.source;
    const tgt = typeof l.target === 'object' ? l.target.id : l.target;
    deg[src] = (deg[src] || 0) + 1;
    deg[tgt] = (deg[tgt] || 0) + 1;
  });
  return deg;
}

/** Pin the highest-degree parent node at (0, 0, 0) and distribute children symmetrically */
function pinHubAtCenter(nodes: any[], links: any[]) {
  const deg = computeDegrees(nodes, links);
  const hub = [...nodes].sort((a, b) => (deg[b.id] || 0) - (deg[a.id] || 0))[0];
  
  const otherNodes = nodes.filter(n => n.id !== hub?.id);
  const count = Math.max(1, otherNodes.length);
  const radius = 100;
  const goldenRatio = (1 + Math.sqrt(5)) / 2;

  nodes.forEach(n => {
    if (n.id === hub?.id) {
      n.fx = 0;
      n.fy = 0;
      n.fz = 0;
      n.x = 0;
      n.y = 0;
      n.z = 0;
      n.vx = 0;
      n.vy = 0;
      n.vz = 0;
    }
  });

  // Fibonacci sphere algorithm distributes child nodes evenly in 3D around the parent
  otherNodes.forEach((n, i) => {
    const theta = Math.acos(1 - (2 * (i + 0.5)) / count);
    const phi = 2 * Math.PI * i / goldenRatio;
    const r = radius + (i % 2 === 0 ? 18 : -12);
    n.x = r * Math.sin(theta) * Math.cos(phi);
    n.y = r * Math.sin(theta) * Math.sin(phi);
    n.z = r * Math.cos(theta);
    delete n.fx;
    delete n.fy;
    delete n.fz;
  });

  return hub;
}

/**
 * Compute the bounding sphere of all node positions and return a camera Z
 * that fits every child node accurately into view with optimal padding.
 */
function computeFitCameraZ(nodes: any[], paddingFactor = 1.75): number {
  const positioned = nodes.filter(n => n.x !== undefined && n.y !== undefined && n.z !== undefined);
  if (positioned.length === 0) return 280;
  let maxDist = 0;
  positioned.forEach(n => {
    const d = Math.sqrt(n.x * n.x + n.y * n.y + n.z * n.z);
    if (d > maxDist) maxDist = d;
  });
  const maxVal = Math.max(14, ...positioned.map(n => n.val || 10));
  return Math.max(240, (maxDist + maxVal + 30) * paddingFactor);
}

/** Fallback static estimate before simulation has run */
function staticCameraZ(nodeCount: number): number {
  return Math.max(240, 110 + Math.sqrt(Math.max(1, nodeCount)) * 65);
}


export const GraphExplorer: React.FC<GraphExplorerProps> = ({ initialSubgraph }) => {
  const [is3DMode,          setIs3DMode]          = useState(true);
  const [autoRotate,        setAutoRotate]         = useState(false);
  const [selectedCategory,  setSelectedCategory]   = useState('all');
  const [isSimulatingWalk,  setIsSimulatingWalk]   = useState(false);
  const [graphData, setGraphData] = useState<{ nodes: any[]; links: any[] }>({
    nodes: DEFAULT_NODES,
    links: DEFAULT_LINKS,
  });
  const [selectedNode, setSelectedNode] = useState<any>(DEFAULT_NODES[0]);
  const [searchQuery,  setSearchQuery]  = useState('');
  const fgRef    = useRef<any>(null);
  const fitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [liveDataLoaded, setLiveDataLoaded] = useState(false);

  // ── Fetch live graph data from backend ────────────────────────────────────
  useEffect(() => {
    // Skip if an injected subgraph is already provided
    if (initialSubgraph?.nodes?.length) return;

    const fetchGraph = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/v1/graph');
        if (!res.ok) return;
        const data = await res.json();

        if (!data.nodes?.length) return; // Backend graph is empty — keep defaults

        const formattedNodes = data.nodes.map((n: any, idx: number) => ({
          id:    n.id,
          name:  n.label || n.id,
          val:   10 + Math.floor(Math.random() * 6),
          type:  n.type?.toLowerCase() || 'core',
          theta: ((idx * 0.35) % Math.PI).toFixed(3),
          desc:  `Knowledge graph entity: ${n.id}`,
        }));
        const formattedLinks = data.edges.map((e: any) => ({
          source: e.source,
          target: e.target,
          label:  e.label || 'RELATED',
        }));
        setGraphData({ nodes: formattedNodes, links: formattedLinks });
        if (formattedNodes.length > 0) setSelectedNode(formattedNodes[0]);
        setLiveDataLoaded(true);
      } catch {
        // Backend unreachable — keep DEFAULT_NODES
      }
    };

    fetchGraph();
    // Refresh every 30s to pick up newly ingested documents
    const interval = setInterval(fetchGraph, 30_000);
    return () => clearInterval(interval);
  }, [initialSubgraph]);

  // ── Load data from chat-injected subgraph (query result) ──────────────────
  useEffect(() => {
    if (!initialSubgraph?.nodes?.length) return;
    const formattedNodes = (initialSubgraph.nodes as any[]).map((n, idx) => ({
      id:    typeof n === 'string' ? n : n.id,
      name:  typeof n === 'string' ? n : n.label || n.id,
      val:   10,
      type:  'core',
      theta: ((idx * 0.35) % Math.PI).toFixed(3),
      desc:  'Candidate node retrieved via multi-hop quantum graph walk',
    }));
    const formattedLinks = (initialSubgraph.edges as any[]).map((e) => ({
      source: e.source,
      target: e.target,
      label:  e.label || 'RELATED',
    }));
    setGraphData({ nodes: formattedNodes, links: formattedLinks });
    if (formattedNodes.length > 0) setSelectedNode(formattedNodes[0]);
  }, [initialSubgraph]);


  // ── Pin hub at center + configure forces whenever graphData or mode changes ─
  useEffect(() => {
    if (!is3DMode) return;

    // Give ForceGraph3D time to mount and attach to fgRef before we configure it
    const initTimer = setTimeout(() => {
      const fg = fgRef.current;
      if (!fg) return;

      // 1. Pin the most-connected parent node at (0, 0, 0) and spread children
      pinHubAtCenter(graphData.nodes, graphData.links);

      // 2. Configure force simulation — strong radial spread and taut links
      fg.d3Force('charge')?.strength(-450);            // strong repulsion avoids clutter
      fg.d3Force('link')?.distance(95).strength(0.75); // links tether children around parent
      
      // Remove any center force that would drag parent away from origin
      const centerForce = fg.d3Force('center');
      if (centerForce) centerForce.strength(0);

      fg.d3ReheatSimulation();

      // 3. Initial camera — centered on origin (0, 0, 0)
      const nCount = graphData.nodes.length;
      fg.cameraPosition({ x: 0, y: 0, z: staticCameraZ(nCount) }, { x: 0, y: 0, z: 0 }, 600);

      // 4. Settle fit: smoothly adjust to frame all children accurately
      if (fitTimer.current) clearTimeout(fitTimer.current);
      fitTimer.current = setTimeout(() => {
        if (!fgRef.current) return;
        const camZ = computeFitCameraZ(graphData.nodes);
        fgRef.current.cameraPosition({ x: 0, y: 0, z: camZ }, { x: 0, y: 0, z: 0 }, 900);
      }, 2000);
    }, 400);

    return () => {
      clearTimeout(initTimer);
      if (fitTimer.current) clearTimeout(fitTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [is3DMode, graphData]);

  // ── Auto-orbit ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!autoRotate || !fgRef.current) return undefined;
    let angle = 0;
    let rafId: number;
    const animate = () => {
      angle += 0.004;
      const r = computeFitCameraZ(graphData.nodes);
      fgRef.current?.cameraPosition({ x: r * Math.sin(angle), z: r * Math.cos(angle) });
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRotate]);

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredNodes = useMemo(() =>
    graphData.nodes.filter(n => {
      const matchSearch = n.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat    = selectedCategory === 'all' || n.type === selectedCategory;
      return matchSearch && matchCat;
    }),
    [graphData.nodes, searchQuery, selectedCategory]);

  // ── Smart Fit: compute from actual node bounding sphere ───────────────────
  const handleFitView = useCallback(() => {
    if (!is3DMode || !fgRef.current) return;
    const camZ = computeFitCameraZ(filteredNodes);
    fgRef.current.cameraPosition({ x: 0, y: 0, z: camZ }, { x: 0, y: 0, z: 0 }, 800);
  }, [is3DMode, filteredNodes]);

  // ── Zoom In / Out ─────────────────────────────────────────────────────────
  const handleZoomIn = useCallback(() => {
    if (!is3DMode || !fgRef.current) return;
    const p = fgRef.current.cameraPosition();
    fgRef.current.cameraPosition({ x: p.x * 0.72, y: p.y * 0.72, z: p.z * 0.72 }, undefined, 350);
  }, [is3DMode]);

  const handleZoomOut = useCallback(() => {
    if (!is3DMode || !fgRef.current) return;
    const p = fgRef.current.cameraPosition();
    fgRef.current.cameraPosition({ x: p.x * 1.38, y: p.y * 1.38, z: p.z * 1.38 }, undefined, 350);
  }, [is3DMode]);

  const handleResetCamera = useCallback(() => {
    if (!is3DMode || !fgRef.current) return;
    // Re-pin hub and reheat, then fit after settle
    pinHubAtCenter(graphData.nodes, graphData.links);
    fgRef.current.d3ReheatSimulation();
    const nCount = filteredNodes.length || graphData.nodes.length;
    fgRef.current.cameraPosition({ x: 0, y: 0, z: staticCameraZ(nCount) }, { x: 0, y: 0, z: 0 }, 600);
    if (fitTimer.current) clearTimeout(fitTimer.current);
    fitTimer.current = setTimeout(() => {
      if (!fgRef.current) return;
      const camZ = computeFitCameraZ(graphData.nodes);
      fgRef.current.cameraPosition({ x: 0, y: 0, z: camZ }, { x: 0, y: 0, z: 0 }, 800);
    }, 2200);
  }, [is3DMode, graphData, filteredNodes.length]);

  // ── Node click ────────────────────────────────────────────────────────────
  const handleNodeClick = useCallback((node: any) => {
    setSelectedNode(node);
    if (is3DMode && fgRef.current && node.x !== undefined) {
      const dist  = 90;
      const ratio = 1 + dist / (Math.hypot(node.x, node.y, node.z) || 1);
      fgRef.current.cameraPosition(
        { x: node.x * ratio, y: node.y * ratio, z: node.z * ratio },
        node, 900
      );
    }
  }, [is3DMode]);

  // ── Quantum Walk simulation ───────────────────────────────────────────────
  const handleSimulateQuantumWalk = useCallback(() => {
    setIsSimulatingWalk(true);
    let step = 0;
    const nodes = graphData.nodes;
    const interval = setInterval(() => {
      if (step >= nodes.length) { clearInterval(interval); setIsSimulatingWalk(false); return; }
      const n = nodes[step];
      setSelectedNode(n);
      if (fgRef.current && is3DMode && n.x !== undefined) {
        fgRef.current.cameraPosition(
          { x: n.x + 60, y: n.y + 40, z: n.z + 80 }, n, 600
        );
      }
      step++;
    }, 900);
  }, [graphData.nodes, is3DMode]);

  // ── 3D Node renderer ──────────────────────────────────────────────────────
  const nodeThreeObject = useCallback((node: any) => {
    const group      = new THREE.Group();
    const isSelected = node.id === selectedNode?.id;
    const radius     = (node.val || 10) * (isSelected ? 1.25 : 1.0);

    // Sphere
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(radius, 32, 32),
      new THREE.MeshPhongMaterial({
        color:            isSelected ? 0xef4444 : (TYPE_COLOR[node.type] ?? 0x4f46e5),
        shininess:        100,
        emissive:         isSelected ? 0x7f1d1d : 0x0f172a,
        emissiveIntensity: isSelected ? 0.45 : 0.2,
      })
    );
    group.add(sphere);

    // Glow orbital ring for selected / main parent node
    if (isSelected || node.fx === 0) {
      const ringColor = isSelected ? 0xef4444 : 0x4f46e5;
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(radius * 1.35, radius * 1.55, 36),
        new THREE.MeshBasicMaterial({ color: ringColor, side: THREE.DoubleSide, opacity: 0.45, transparent: true })
      );
      ring.rotation.x = Math.PI / 2.3;
      group.add(ring);
    }

    // Billboard label — crisp canvas texture
    const canvas = document.createElement('canvas');
    canvas.width  = 540;
    canvas.height = 100;
    const ctx = canvas.getContext('2d')!;
    
    // Background pill badge
    ctx.fillStyle = isSelected ? 'rgba(239, 68, 68, 0.96)' : 'rgba(255, 255, 255, 0.96)';
    ctx.beginPath();
    ctx.roundRect(8, 8, 524, 84, [20]);
    ctx.fill();
    ctx.strokeStyle = isSelected ? '#ffffff' : '#cbd5e1';
    ctx.lineWidth = 3.5;
    ctx.stroke();

    // Text rendering
    const maxChars = 28;
    const label = node.name.length > maxChars ? node.name.slice(0, maxChars - 1) + '…' : node.name;
    ctx.font = 'bold 27px "Plus Jakarta Sans", Inter, system-ui, sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = isSelected ? '#ffffff' : '#0f172a';
    ctx.fillText(label, 270, 52);

    const tex = new THREE.CanvasTexture(canvas);
    tex.minFilter = THREE.LinearFilter;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthTest: false }));
    sprite.scale.set(46, 9.5, 1);
    sprite.position.set(0, radius + 12, 0);
    group.add(sprite);

    return group;
  }, [selectedNode]);

  // ── Connected edges for inspector ────────────────────────────────────────
  const connectedEdges = useMemo(() =>
    graphData.links
      .filter(l => {
        const src = typeof l.source === 'object' ? l.source.id : l.source;
        const tgt = typeof l.target === 'object' ? l.target.id : l.target;
        return src === selectedNode?.id || tgt === selectedNode?.id;
      })
      .map(l => {
        const src   = typeof l.source === 'object' ? l.source.id : l.source;
        const tgt   = typeof l.target === 'object' ? l.target.id : l.target;
        const other = src === selectedNode?.id ? tgt : src;
        return { label: l.label, other };
      }),
    [graphData.links, selectedNode]);

  // ─────────────────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

      {/* ═══ LEFT: 3D / 2D Canvas ═══ */}
      <div style={{
        flex: 1,
        position: 'relative',
        background: '#f8fafc',
        backgroundImage: `
          radial-gradient(#cbd5e1 1.2px, transparent 1.2px),
          radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.92) 0%, rgba(241, 245, 249, 0.95) 55%, #e2e8f0 100%)
        `,
        backgroundSize: '28px 28px, 100% 100%',
        overflow: 'hidden'
      }}>

        {/* ── TOP toolbar (essential controls only) ── */}
        <div style={{
          position: 'absolute', top: 14, left: 14, right: 14, zIndex: 20,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          pointerEvents: 'none',
        }}>
          {/* Left: search + fit + reset */}
          <div style={{ display: 'flex', gap: 8, pointerEvents: 'auto' }}>
            <div style={{ position: 'relative', width: 210 }}>
              <Search size={13} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search entities…"
                style={{
                  width: '100%', padding: '7px 10px 7px 30px', fontSize: '12px',
                  border: '1px solid #e2e8f0', borderRadius: 8,
                  background: 'rgba(255,255,255,0.97)', outline: 'none',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                }}
              />
            </div>

            <button onClick={handleFitView}    style={hudBtn} title="Smart fit based on node count"><Maximize size={12} /> Fit</button>
            <button onClick={handleResetCamera} style={hudBtn} title="Reset camera"><RotateCcw size={12} /> Reset</button>
            {liveDataLoaded && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: 6, fontSize: '11px', fontWeight: 600, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} /> Live
              </span>
            )}
          </div>

          {/* Right: category pills + 3D/2D toggle + orbit + simulate */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto' }}>
            {/* Category filter pills */}
            <div style={pillGroup}>
              {CATEGORIES.map(c => (
                <button
                  key={c.key}
                  onClick={() => setSelectedCategory(c.key)}
                  style={{ ...pill, ...(selectedCategory === c.key ? pillActive : {}) }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* 3D / 2D */}
            <div style={pillGroup}>
              <button onClick={() => setIs3DMode(true)}  style={{ ...pill, ...(is3DMode  ? pillActive : {}) }}><Box    size={11} /> 3D</button>
              <button onClick={() => setIs3DMode(false)} style={{ ...pill, ...(!is3DMode ? pillActive : {}) }}><Layers size={11} /> 2D</button>
            </div>

            {/* Auto Orbit */}
            {is3DMode && (
              <button onClick={() => setAutoRotate(v => !v)} style={{ ...hudBtn, ...(autoRotate ? hudBtnActive : {}) }}>
                {autoRotate ? <Pause size={12} /> : <Play size={12} />}
                {autoRotate ? 'Stop' : 'Orbit'}
              </button>
            )}

            {/* Quantum Walk */}
            <button onClick={handleSimulateQuantumWalk} disabled={isSimulatingWalk} style={{ ...hudBtn, ...(isSimulatingWalk ? hudBtnActive : {}) }}>
              <Zap size={12} />
              {isSimulatingWalk ? 'Simulating…' : 'Walk'}
            </button>
          </div>
        </div>

        {/* ── 3D / 2D Graph ── */}
        <div style={{ width: '100%', height: '100%' }}>
          {is3DMode ? (
            <ForceGraph3D
              ref={fgRef}
              graphData={{ nodes: filteredNodes, links: graphData.links }}
              nodeThreeObject={nodeThreeObject}
              nodeThreeObjectExtend={false}
              linkColor={() => 'rgba(148, 163, 184, 0.7)'}
              linkWidth={2.2}
              linkLabel="label"
              linkDirectionalParticles={4}
              linkDirectionalParticleSpeed={0.008}
              linkDirectionalParticleWidth={2.8}
              linkDirectionalParticleColor={() => '#4f46e5'}
              onNodeClick={handleNodeClick}
              backgroundColor="rgba(0,0,0,0)"
              enableNodeDrag={true}
              enableNavigationControls={true}
              showNavInfo={false}
            />
          ) : (
            <ForceGraph2D
              graphData={{ nodes: filteredNodes, links: graphData.links }}
              nodeLabel="name"
              nodeCanvasObject={(node, ctx, globalScale) => {
                const label    = node.name as string;
                const fontSize = 13 / globalScale;
                ctx.font = `${fontSize}px "Plus Jakarta Sans", sans-serif`;
                const isSelected = node.id === selectedNode?.id;
                ctx.beginPath();
                ctx.arc(node.x!, node.y!, 9, 0, 2 * Math.PI, false);
                ctx.fillStyle = isSelected ? '#ef4444' : (TYPE_HEX[node.type as string] ?? '#4f46e5');
                ctx.fill();
                ctx.lineWidth   = 2 / globalScale;
                ctx.strokeStyle = '#ffffff';
                ctx.stroke();
                const textWidth  = ctx.measureText(label).width;
                const bh         = fontSize + 4;
                const bw         = textWidth + 8;
                ctx.fillStyle = 'rgba(255,255,255,0.95)';
                ctx.fillRect(node.x! - bw / 2, node.y! + 12, bw, bh);
                ctx.textAlign    = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle    = '#0f172a';
                ctx.fillText(label, node.x!, node.y! + 12 + bh / 2);
              }}
              linkColor={() => '#94a3b8'}
              linkWidth={2}
              linkLabel="label"
              linkDirectionalParticles={3}
              linkDirectionalParticleSpeed={0.007}
              linkDirectionalParticleWidth={3}
              linkDirectionalParticleColor={() => '#4f46e5'}
              onNodeClick={handleNodeClick}
              backgroundColor="#f8fafc"
            />
          )}
        </div>

        {/* ── BOTTOM: hint + zoom dock ── */}
        <div style={{
          position: 'absolute', bottom: 14, left: 14, right: 14, zIndex: 20,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          pointerEvents: 'none',
        }}>
          <div style={{ ...floatChip, pointerEvents: 'none', fontSize: 11, color: '#64748b' }}>
            🖱️ <b>Drag</b> Orbit · <b>Right-drag</b> Pan · <b>Scroll</b> Zoom · <b>Click</b> Inspect
          </div>

          {/* Zoom in / out dock */}
          <div style={{ display: 'flex', pointerEvents: 'auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              style={{ padding: '8px 12px', border: 'none', borderRight: '1px solid #e2e8f0', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#475569' }}
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              style={{ padding: '8px 12px', border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#475569' }}
            >
              <ZoomOut size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT: Inspector Panel ═══ */}
      <aside style={{
        width: 320, flexShrink: 0,
        background: '#ffffff', borderLeft: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{ padding: '13px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Compass size={14} color="#4f46e5" />
            </div>
            <span style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Entity Inspector</span>
          </div>
          <span style={{ fontSize: 10, background: '#eef2ff', color: '#4f46e5', fontWeight: 700, padding: '2px 8px', borderRadius: 99, border: '1px solid #c7d2fe' }}>
            {is3DMode ? '3D' : '2D'}
          </span>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {selectedNode ? (
            <>
              {/* Entity card */}
              <div style={{ background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0', padding: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#94a3b8', fontWeight: 700 }}>Active Entity</span>
                  <span style={{
                    fontSize: 9.5,
                    background: (TYPE_HEX[selectedNode.type] ?? '#4f46e5') + '1a',
                    color: TYPE_HEX[selectedNode.type] ?? '#4f46e5',
                    border: `1px solid ${TYPE_HEX[selectedNode.type] ?? '#4f46e5'}40`,
                    padding: '2px 7px', borderRadius: 99, fontWeight: 700,
                  }}>{selectedNode.type ?? 'node'}</span>
                </div>
                <div style={{ fontFamily: '"Plus Jakarta Sans", sans-serif', fontSize: 14.5, fontWeight: 700, color: '#0f172a', marginBottom: 5 }}>
                  {selectedNode.name || selectedNode.id}
                </div>
                {selectedNode.desc && (
                  <p style={{ fontSize: 11.5, color: '#64748b', lineHeight: 1.5, margin: 0 }}>{selectedNode.desc}</p>
                )}
              </div>

              {/* XYZ Coordinates */}
              <div>
                <div style={sLabel}>Spatial Coordinates (X · Y · Z)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7 }}>
                  {[
                    { axis: 'X', val: selectedNode.x, color: '#4f46e5' },
                    { axis: 'Y', val: selectedNode.y, color: '#8b5cf6' },
                    { axis: 'Z', val: selectedNode.z, color: '#10b981' },
                  ].map(({ axis, val, color }) => (
                    <div key={axis} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 5px', textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 2 }}>{axis}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color }}>
                        {val !== undefined ? Number(val).toFixed(1) : '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hilbert gauge */}
              <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: 10, padding: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: '#3730a3' }}>θ Hilbert Rotation</span>
                  <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 800, color: '#4f46e5' }}>
                    {selectedNode.theta || '0.785'} rad
                  </span>
                </div>
                <div style={{ height: 5, background: '#c7d2fe', borderRadius: 99, overflow: 'hidden', marginBottom: 7 }}>
                  <div style={{
                    height: '100%', borderRadius: 99,
                    width: `${Math.min((parseFloat(selectedNode.theta || '0.785') / Math.PI) * 100, 100)}%`,
                    background: 'linear-gradient(90deg, #4f46e5, #8b5cf6)',
                  }} />
                </div>
                <p style={{ fontSize: 11, color: '#4338ca', lineHeight: 1.5, margin: 0 }}>
                  Mapped to Rᵧ(θ) gate in the 14-qubit CTQW circuit.
                </p>
              </div>

              {/* Connected edges */}
              <div>
                <div style={sLabel}>Connected Edges ({connectedEdges.length})</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {connectedEdges.length === 0 && (
                    <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: '10px 0' }}>No connections in current filter</div>
                  )}
                  {connectedEdges.map((e, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8,
                      padding: '7px 11px', fontSize: 12,
                    }}>
                      <span style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 10.5 }}>{e.label}</span>
                      <span style={{ color: '#0f172a', fontWeight: 600, maxWidth: 130, textAlign: 'right', lineHeight: 1.3 }}>{e.other}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', margin: 'auto', padding: 30, color: '#94a3b8', fontSize: 12 }}>
              <Compass size={30} style={{ margin: '0 auto 10px', opacity: 0.3, display: 'block' }} />
              Click any node in the canvas to inspect its properties.
            </div>
          )}
        </div>

        {/* Focus button */}
        {selectedNode && (
          <div style={{ padding: '12px 14px', borderTop: '1px solid #e2e8f0' }}>
            <button
              onClick={() => handleNodeClick(selectedNode)}
              style={{
                width: '100%', padding: '9px', borderRadius: 8, border: 'none',
                background: '#4f46e5',
                color: '#fff', fontWeight: 600, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                boxShadow: '0 2px 8px rgba(79,70,229,0.35)',
              }}
            >
              <Target size={13} /> Focus Camera on Node
            </button>
          </div>
        )}
      </aside>
    </div>
  );
};

// ── Inline style constants ────────────────────────────────────────────────────
const hudBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px',
  fontSize: 12, fontWeight: 600, border: '1px solid #e2e8f0', borderRadius: 8,
  background: 'rgba(255,255,255,0.97)', color: '#334155', cursor: 'pointer',
  boxShadow: '0 1px 4px rgba(0,0,0,0.07)', whiteSpace: 'nowrap',
};
const hudBtnActive: React.CSSProperties = { background: '#4f46e5', color: '#fff', borderColor: '#4f46e5' };
const pillGroup: React.CSSProperties = {
  display: 'flex', background: 'rgba(255,255,255,0.97)', border: '1px solid #e2e8f0',
  borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
};
const pill: React.CSSProperties = {
  padding: '5px 10px', fontSize: 11.5, fontWeight: 600, border: 'none',
  background: 'transparent', color: '#64748b', cursor: 'pointer', whiteSpace: 'nowrap',
  display: 'flex', alignItems: 'center', gap: 4,
};
const pillActive: React.CSSProperties = { background: '#4f46e5', color: '#fff' };
const floatChip: React.CSSProperties = {
  background: 'rgba(255,255,255,0.95)', border: '1px solid #e2e8f0',
  borderRadius: 8, padding: '6px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
};
const sLabel: React.CSSProperties = {
  fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em',
  color: '#94a3b8', fontWeight: 700, marginBottom: 7,
};
