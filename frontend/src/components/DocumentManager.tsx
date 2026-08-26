import { useState, useRef, useCallback } from 'react';
import { useToast } from '../hooks/useToast';
import axios from 'axios';
import {
  UploadCloud, Database, Trash2, CheckCircle2,
  FileText, FileSpreadsheet, File, FileCode,
  X, Sparkles
} from 'lucide-react';

// ── Supported file types ───────────────────────────────────────────────────
const ACCEPTED_TYPES: Record<string, { label: string; mime: string[]; icon: any; color: string }> = {
  pdf:  { label: 'PDF',       mime: ['application/pdf'],                                                         icon: FileText,        color: '#ef4444' },
  csv:  { label: 'CSV',       mime: ['text/csv', 'application/csv'],                                             icon: FileSpreadsheet, color: '#10b981' },
  docx: { label: 'DOCX',     mime: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],  icon: FileText,        color: '#2563eb' },
  doc:  { label: 'DOC',      mime: ['application/msword'],                                                       icon: FileText,        color: '#2563eb' },
  txt:  { label: 'TXT',      mime: ['text/plain'],                                                               icon: FileText,        color: '#64748b' },
  json: { label: 'JSON',     mime: ['application/json'],                                                         icon: FileCode,        color: '#f59e0b' },
  md:   { label: 'Markdown', mime: ['text/markdown', 'text/x-markdown'],                                         icon: FileCode,        color: '#8b5cf6' },
};

const ACCEPT_ATTR = Object.values(ACCEPTED_TYPES).flatMap(t => t.mime).join(',') + ',.pdf,.csv,.docx,.doc,.txt,.json,.md';


// ── Get icon + color by file extension ────────────────────────────────────
function getFileMeta(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return ACCEPTED_TYPES[ext] ?? { label: ext.toUpperCase(), icon: File, color: '#64748b' };
}

// ── Format bytes ──────────────────────────────────────────────────────────
function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentManager() {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  const [dragOver,      setDragOver]      = useState(false);
  const [selectedFile,  setSelectedFile]  = useState<File | null>(null);
  const [isUploading,   setIsUploading]   = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [documents,     setDocuments]     = useState<Array<{
    id: string; title: string; fileType: string; size: string; status: string; timestamp: string;
  }>>([
    { id: 'doc-1', title: 'Quantum Computing and Trotterization Overview', fileType: 'PDF',  size: '—',    status: 'Indexed', timestamp: 'Online' },
    { id: 'doc-2', title: 'BCS Superconductivity Hamiltonian Matrix',       fileType: 'DOCX', size: '—',    status: 'Indexed', timestamp: 'Online' },
  ]);

  // ── File selection ────────────────────────────────────────────────────────
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setStatusMessage(null);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }, []);

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = () => setDragOver(false);

  const clearFile = () => {
    setSelectedFile(null);
    setStatusMessage(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  // ── Ingest ────────────────────────────────────────────────────────────────
  const handleIngest = async () => {
    if (!selectedFile || isUploading) return;
    setIsUploading(true);
    setStatusMessage(`Uploading ${selectedFile.name} to server for text extraction…`);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await axios.post(
        `http://${window.location.hostname}:8000/api/v1/documents/upload-file`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const meta = getFileMeta(selectedFile.name);
      setDocuments(prev => [{
        id:        res.data.doc_id || `doc-${Date.now()}`,
        title:     selectedFile.name,
        fileType:  meta.label,
        size:      fmtSize(selectedFile.size),
        status:    'Indexed',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }, ...prev]);

      const chars = res.data.chars_extracted ? ` (${res.data.chars_extracted.toLocaleString()} characters extracted)` : '';
      setStatusMessage(`✅ Ingestion queued${chars} — triples stored in Knowledge Graph & embeddings indexed in Qdrant.`);
      showToast('Document ingested successfully!', 'success');
      clearFile();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Server error';
      setStatusMessage(`Upload failed: ${msg}`);
      showToast(`Upload failed: ${msg}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!confirm('Remove document from Qdrant vector index and graph store?')) return;
    try {
      await axios.delete(`http://${window.location.hostname}:8000/api/v1/documents/${docId}`);
      setDocuments(prev => prev.filter(d => d.id !== docId));
      showToast('Document deleted.', 'info');
    } catch {
      showToast('Failed to delete document.', 'error');
    }
  };

  const fileMeta = selectedFile ? getFileMeta(selectedFile.name) : null;
  const FileIcon = fileMeta?.icon ?? File;

  // ────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20, padding: 24, height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

      {/* ═══ LEFT: Ingestion Card ═══ */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--bd-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--r-md)', background: 'var(--primary-lt)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UploadCloud size={20} color="var(--primary)" />
            </div>
            <div>
              <h3 className="font-headline" style={{ fontSize: 15, fontWeight: 700, color: 'var(--t1)' }}>
                Document Ingestion
              </h3>
              <p style={{ fontSize: 12, color: 'var(--t3)' }}>
                Upload a file — we extract text, build knowledge triplets, and index 768-dim embeddings.
              </p>
            </div>
          </div>
          <span className="badge b-indigo">Automated Pipeline</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── Supported type chips ── */}
          <div>
            <p style={{ fontSize: 11, color: 'var(--t4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
              Supported File Types
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {Object.entries(ACCEPTED_TYPES).map(([ext, t]) => {
                const TIcon = t.icon;
                return (
                  <div key={ext} style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 12px', borderRadius: 99,
                    background: t.color + '12', border: `1px solid ${t.color}30`,
                    fontSize: 12, fontWeight: 600, color: t.color,
                  }}>
                    <TIcon size={12} />
                    {t.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Drop Zone ── */}
          {!selectedFile ? (
            <div
              onClick={() => inputRef.current?.click()}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              style={{
                flex: 1,
                border: `2px dashed ${dragOver ? 'var(--primary)' : '#cbd5e1'}`,
                borderRadius: 14,
                background: dragOver ? 'var(--primary-lt)' : '#f8fafc',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 14, cursor: 'pointer',
                transition: 'all 0.15s ease',
                minHeight: 220,
              }}
            >
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: dragOver ? 'var(--primary)' : '#e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}>
                <UploadCloud size={28} color={dragOver ? '#fff' : '#94a3b8'} />
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)', marginBottom: 4 }}>
                  Drop your file here, or <span style={{ color: 'var(--primary)' }}>click to browse</span>
                </p>
                <p style={{ fontSize: 12, color: 'var(--t4)' }}>
                  PDF · CSV · DOCX · DOC · TXT · JSON · Markdown
                </p>
              </div>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT_ATTR}
                onChange={onInputChange}
                style={{ display: 'none' }}
              />
            </div>
          ) : (
            /* ── Selected file preview ── */
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
              border: '1.5px solid #c7d2fe', borderRadius: 14,
              background: 'var(--primary-lt)', padding: 28, gap: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 12,
                    background: (fileMeta?.color ?? '#4f46e5') + '20',
                    border: `1.5px solid ${(fileMeta?.color ?? '#4f46e5')}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <FileIcon size={24} color={fileMeta?.color ?? '#4f46e5'} />
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 2 }}>{selectedFile.name}</p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99,
                        background: (fileMeta?.color ?? '#4f46e5') + '18',
                        color: fileMeta?.color ?? '#4f46e5',
                        border: `1px solid ${(fileMeta?.color ?? '#4f46e5')}30`,
                      }}>{fileMeta?.label}</span>
                      <span style={{ fontSize: 11, color: 'var(--t4)' }}>{fmtSize(selectedFile.size)}</span>
                    </div>
                  </div>
                </div>
                <button onClick={clearFile} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--t4)', padding: 4 }}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ height: 1, background: '#c7d2fe' }} />
              <p style={{ fontSize: 12, color: 'var(--primary-text)', lineHeight: 1.6 }}>
                ✅ File selected. Click <strong>Ingest Document</strong> to extract entities, build knowledge triplets, and index embeddings into Qdrant.
              </p>
            </div>
          )}

          {/* ── Status message ── */}
          {statusMessage && (
            <div style={{
              padding: '11px 14px', borderRadius: 10,
              background: 'var(--primary-lt)', border: '1px solid #c7d2fe',
              color: 'var(--primary-text)', fontSize: 12.5,
              display: 'flex', alignItems: 'center', gap: 9,
            }}>
              <Sparkles size={15} color="var(--primary)" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* ── Action row ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11.5, color: 'var(--t4)' }}>
              Triplets are automatically added to the global Knowledge Graph.
            </span>
            <button
              onClick={handleIngest}
              disabled={!selectedFile || isUploading}
              className="btn btn-primary"
              style={{ padding: '10px 22px' }}
            >
              {isUploading ? <span className="spin" /> : <UploadCloud size={15} />}
              <span>{isUploading ? 'Extracting & Indexing…' : 'Ingest Document'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ═══ RIGHT: Indexed Library ═══ */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--bd-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Database size={16} color="var(--primary)" />
            <span className="font-headline" style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>
              Indexed Library ({documents.length})
            </span>
          </div>
          <span className="badge b-green">Qdrant Store</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {documents.map(doc => {
            const dm = getFileMeta(doc.title);
            const DIcon = dm.icon;
            return (
              <div key={doc.id} style={{
                padding: '12px 14px', borderRadius: 10,
                background: '#f8fafc', border: '1px solid var(--bd)',
                display: 'flex', flexDirection: 'column', gap: 7,
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: dm.color + '14', border: `1px solid ${dm.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <DIcon size={15} color={dm.color} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--t1)', lineHeight: 1.35 }}>{doc.title}</p>
                      <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 99,
                          background: dm.color + '14', color: dm.color, border: `1px solid ${dm.color}25`,
                        }}>{doc.fileType}</span>
                        {doc.size !== '—' && <span style={{ fontSize: 10, color: 'var(--t4)' }}>{doc.size}</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--t4)', cursor: 'pointer', padding: 2, flexShrink: 0 }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--t4)')}
                    title="Delete document"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                  <span className="badge b-green" style={{ fontSize: '10px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={10} /> {doc.status}
                  </span>
                  <span className="mono" style={{ color: 'var(--t4)' }}>{doc.timestamp}</span>
                </div>
              </div>
            );
          })}

          {documents.length === 0 && (
            <div style={{ textAlign: 'center', margin: 'auto', padding: 30, color: 'var(--t4)', fontSize: 12 }}>
              Library is empty. Upload a file to get started.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
