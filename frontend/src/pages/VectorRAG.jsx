import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Database,
  Search,
  UploadCloud,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';

export const VectorRAG = () => {
  // Document Ingestion State
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('custom_doc');
  const [content, setContent] = useState('');
  const [ingesting, setIngesting] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState(null);
  const [ingestError, setIngestError] = useState(null);

  // Document List State
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Semantic Search State
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(4);
  const [filterType, setFilterType] = useState('');
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState(null);
  const [searchError, setSearchError] = useState(null);

  // Load documents on mount
  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      const docs = await api.listDocuments();
      setDocuments(docs || []);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleIngest = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setIngestError('Title and content are required.');
      return;
    }

    setIngesting(true);
    setIngestSuccess(null);
    setIngestError(null);

    try {
      const doc = await api.ingestDocument({
        title: title.trim(),
        document_type: documentType,
        content: content.trim(),
        metadata: { source: 'rag_studio', created_via: 'web' },
      });
      setIngestSuccess(`Document ingested successfully into ${doc.chunk_count} semantic vector chunks.`);
      setTitle('');
      setContent('');
      await fetchDocuments();
      setTimeout(() => setIngestSuccess(null), 4000);
    } catch (err) {
      setIngestError(err.message || 'Ingestion failed.');
    } finally {
      setIngesting(false);
    }
  };

  const handleDeleteDoc = async (id) => {
    try {
      await api.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (matches) {
        setMatches((prev) => (prev ? prev.filter((m) => m.document_id !== id) : null));
      }
    } catch (err) {
      alert('Failed to delete document: ' + (err.message || err));
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setSearchError(null);

    try {
      const res = await api.queryRAG({
        query: query.trim(),
        top_k: topK,
        document_type: filterType || null,
      });
      setMatches(res.matches || []);
    } catch (err) {
      setSearchError(err.message || 'Query failed.');
    } finally {
      setSearching(false);
    }
  };

  const loadSampleDoc = () => {
    setTitle('Distributed Cloud Platform Experience');
    setDocumentType('resume');
    setContent(`EXPERIENCE
Principal Architect at Vertex Systems (2021 - Present):
- Designed high-throughput vector retrieval engine handling 5,000 queries per second using PostgreSQL pgvector with HNSW cosine indexes.
- Led the migration of 40+ microservices from on-prem to AWS EKS with zero downtime.
- Built real-time LLM inference pipelines with bounded token costs, reducing latency by 45%.

TECHNICAL SKILLS:
- Languages & Frameworks: Python, TypeScript, FastAPI, React, SQLAlchemy, LangGraph
- Cloud & Infrastructure: AWS (EKS, RDS, S3), Docker, Kubernetes, Terraform
- Databases: PostgreSQL, pgvector, Redis, SQLite`);
  };

  return (
    <div style={{ maxWidth: '1152px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.025em', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Database style={{ width: '24px', height: '24px', color: 'var(--brand-primary)' }} />
            <span>Vector RAG Knowledge Base</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Ingest candidate evidence, slice into semantic chunks, and query PostgreSQL pgvector with verifiable citations.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge badge-indigo" style={{ fontFamily: 'monospace' }}>
            pgvector HNSW (1536-dim)
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
        {/* Left Column: Ingest & Manage Documents */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 600, fontSize: '0.875rem' }}>
                <UploadCloud style={{ width: '16px', height: '16px', color: 'var(--brand-primary)' }} />
                <span>Ingest Knowledge Document</span>
              </div>
              <button
                type="button"
                onClick={loadSampleDoc}
                style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: '0.75rem', fontWeight: 500, textDecoration: 'underline', cursor: 'pointer' }}
              >
                Load Sample
              </button>
            </div>

            {ingestSuccess && (
              <div className="alert-box alert-success">
                <CheckCircle2 style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <span>{ingestSuccess}</span>
              </div>
            )}

            {ingestError && (
              <div className="alert-box alert-danger">
                <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <span>{ingestError}</span>
              </div>
            )}

            <form onSubmit={handleIngest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Document Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Resume Experience 2024"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Document Type</label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="form-input"
                >
                  <option value="resume">Resume / Career Section</option>
                  <option value="job">Job Description / Requirements</option>
                  <option value="application_note">Application Notes & History</option>
                  <option value="custom_doc">Custom Career Document / Project</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Content (Plain text or Markdown)</label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste career bullet points, responsibilities, or skills..."
                  className="form-input"
                  style={{ resize: 'none' }}
                />
              </div>

              <button
                type="submit"
                disabled={ingesting}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <UploadCloud style={{ width: '16px', height: '16px' }} />
                <span>{ingesting ? 'Chunking & Embedding...' : 'Chunk & Store in Vector DB'}</span>
              </button>
            </form>
          </div>

          {/* Ingested Documents List */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 600, fontSize: '0.875rem' }}>
                <BookOpen style={{ width: '16px', height: '16px', color: 'var(--brand-primary)' }} />
                <span>Stored Documents ({documents.length})</span>
              </div>
            </div>

            {loadingDocs ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                Loading documents...
              </div>
            ) : documents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-dim)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                <Database style={{ width: '32px', height: '32px', color: 'var(--text-dim)' }} />
                <p>No documents stored yet. Ingest a document above to populate your vector store.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', maxHeight: '18rem', overflowY: 'auto', paddingRight: '0.25rem' }}>
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ minWidth: 0, paddingRight: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {doc.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <span className="badge badge-indigo" style={{ fontSize: '0.625rem', fontFamily: 'monospace' }}>
                          {doc.document_type}
                        </span>
                        <span style={{ fontSize: '0.625rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                          {doc.chunk_count} {doc.chunk_count === 1 ? 'chunk' : 'chunks'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      title="Delete document"
                      style={{ padding: '0.375rem', color: 'var(--text-dim)', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: 'var(--radius-md)' }}
                    >
                      <Trash2 style={{ width: '14px', height: '14px' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Semantic Search & Evidence Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ffffff', fontWeight: 600, fontSize: '0.875rem' }}>
                <Search style={{ width: '16px', height: '16px', color: 'var(--brand-primary)' }} />
                <span>Ask Your Knowledge Base (Semantic Search)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 500 }}>
                <ShieldCheck style={{ width: '16px', height: '16px', color: '#34d399' }} />
                <span>Zero Fabrication Grounding</span>
              </div>
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ position: 'relative' }}>
                <Search style={{ width: '16px', height: '16px', color: 'var(--text-dim)', position: 'absolute', left: '14px', top: '14px' }} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. 'Kubernetes cluster deployment experience' or 'system design'..."
                  className="form-input"
                  style={{ paddingLeft: '2.5rem', paddingRight: '6rem' }}
                />
                <button
                  type="submit"
                  disabled={searching || !query.trim()}
                  className="btn btn-primary"
                  style={{ position: 'absolute', right: '6px', top: '6px', padding: '0.375rem 1rem', fontSize: '0.75rem' }}
                >
                  {searching ? 'Querying...' : 'Search'}
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Sliders style={{ width: '14px', height: '14px', color: 'var(--text-dim)' }} />
                  <span>Top-K Chunks:</span>
                  <select
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value))}
                    className="form-input"
                    style={{ padding: '0.25rem 0.5rem', width: 'auto', fontSize: '0.75rem' }}
                  >
                    <option value={2}>2</option>
                    <option value={4}>4</option>
                    <option value={6}>6</option>
                    <option value={8}>8</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <span>Type Filter:</span>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="form-input"
                    style={{ padding: '0.25rem 0.5rem', width: 'auto', fontSize: '0.75rem' }}
                  >
                    <option value="">All Types</option>
                    <option value="resume">Resume Only</option>
                    <option value="job">Job Only</option>
                    <option value="custom_doc">Custom Docs Only</option>
                  </select>
                </div>
              </div>
            </form>

            {searchError && (
              <div className="alert-box alert-danger">
                <AlertCircle style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                <span>{searchError}</span>
              </div>
            )}
          </div>

          {/* Search Results Display */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.25rem', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
              <span>Retrieved Evidence Chunks</span>
              <span>{matches ? `${matches.length} Results` : 'Awaiting Query'}</span>
            </div>

            {searching ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--brand-primary)', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
                <p>Computing cosine similarity in pgvector...</p>
              </div>
            ) : matches === null ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                <Search style={{ width: '32px', height: '32px', color: 'var(--text-dim)' }} />
                <p style={{ maxWidth: '380px' }}>
                  Type a technical skill, experience query, or role requirement above to inspect retrieved vector evidence chunks and similarity confidence.
                </p>
              </div>
            ) : matches.length === 0 ? (
              <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <FileText style={{ width: '32px', height: '32px', color: 'var(--text-dim)' }} />
                <p>No matching evidence chunks found for this query in the vector store.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {matches.map((match) => {
                  const scorePercent = Math.round(match.similarity_score * 100);
                  const isHighMatch = scorePercent >= 75;
                  const isMedMatch = scorePercent >= 50;

                  return (
                    <div
                      key={match.chunk_id}
                      className="glass-panel"
                      style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {match.document_title}
                          </span>
                          <span className="badge badge-indigo" style={{ fontSize: '0.625rem', fontFamily: 'monospace' }}>
                            {match.document_type}
                          </span>
                        </div>
                        <span
                          className={`badge ${isHighMatch ? 'badge-success' : isMedMatch ? 'badge-indigo' : 'badge-neutral'}`}
                          style={{ fontFamily: 'monospace', fontWeight: 600 }}
                        >
                          {scorePercent}% Similarity
                        </span>
                      </div>

                      <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-lg)', backgroundColor: 'rgba(2, 6, 23, 0.8)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                        {match.content}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.6875rem', color: 'var(--text-dim)', paddingTop: '0.25rem', borderTop: '1px solid var(--border-subtle)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--brand-primary)' }}>
                          <ShieldCheck style={{ width: '14px', height: '14px', color: '#34d399' }} />
                          <span>Chunk ID: {match.chunk_id.slice(0, 8)}...</span>
                        </div>
                        <span>Source Attribution Verified</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
