import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RAGDocument, RAGQueryMatch } from '../types/rag';
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

export const VectorRAG: React.FC = () => {
  // Document Ingestion State
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('custom_doc');
  const [content, setContent] = useState('');
  const [ingesting, setIngesting] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState<string | null>(null);
  const [ingestError, setIngestError] = useState<string | null>(null);

  // Document List State
  const [documents, setDocuments] = useState<RAGDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);

  // Semantic Search State
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(4);
  const [filterType, setFilterType] = useState<string>('');
  const [searching, setSearching] = useState(false);
  const [matches, setMatches] = useState<RAGQueryMatch[] | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Load documents on mount
  const fetchDocuments = async () => {
    try {
      setLoadingDocs(true);
      const docs = await api.listDocuments();
      setDocuments(docs);
    } catch (err: any) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleIngest = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setIngestError(err.message || 'Ingestion failed.');
    } finally {
      setIngesting(false);
    }
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      await api.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      if (matches) {
        setMatches((prev) => (prev ? prev.filter((m) => m.document_id !== id) : null));
      }
    } catch (err: any) {
      alert('Failed to delete document: ' + err.message);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
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
      setMatches(res.matches);
    } catch (err: any) {
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
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2.5">
            <Database className="w-6 h-6 text-indigo-400" />
            <span>Vector RAG Knowledge Base</span>
          </h1>
          <p className="text-sm text-slate-400">
            Ingest candidate evidence, slice into semantic chunks, and query PostgreSQL pgvector with verifiable citations.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs px-3 py-1 rounded-full font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            pgvector HNSW (1536-dim)
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Ingest & Manage Documents (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white font-semibold text-sm">
                <UploadCloud className="w-4 h-4 text-indigo-400" />
                <span>Ingest Knowledge Document</span>
              </div>
              <button
                type="button"
                onClick={loadSampleDoc}
                className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 underline"
              >
                Load Sample
              </button>
            </div>

            {ingestSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{ingestSuccess}</span>
              </div>
            )}

            {ingestError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{ingestError}</span>
              </div>
            )}

            <form onSubmit={handleIngest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Document Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Resume Experience 2024"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Document Type
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="resume">Resume / Career Section</option>
                  <option value="job">Job Description / Requirements</option>
                  <option value="application_note">Application Notes & History</option>
                  <option value="custom_doc">Custom Career Document / Project</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Content (Plain text or Markdown)
                </label>
                <textarea
                  required
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste career bullet points, responsibilities, or skills..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={ingesting}
                className="w-full inline-flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/25 active:scale-98"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{ingesting ? 'Chunking & Embedding...' : 'Chunk & Store in Vector DB'}</span>
              </button>
            </form>
          </div>

          {/* Ingested Documents List */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white font-semibold text-sm">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Stored Documents ({documents.length})</span>
              </div>
            </div>

            {loadingDocs ? (
              <div className="text-center py-6 text-slate-500 text-xs">Loading documents...</div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs space-y-2">
                <Database className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No documents stored yet. Ingest a document above to populate your vector store.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-slate-200 truncate">{doc.title}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono">
                          {doc.document_type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {doc.chunk_count} {doc.chunk_count === 1 ? 'chunk' : 'chunks'}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDoc(doc.id)}
                      title="Delete document"
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Semantic Search & Evidence Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white font-semibold text-sm">
                <Search className="w-4 h-4 text-indigo-400" />
                <span>Ask Your Knowledge Base (Semantic Search)</span>
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-indigo-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Fabrication Grounding</span>
              </div>
            </div>

            <form onSubmit={handleSearch} className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. 'Kubernetes cluster deployment experience' or 'system design'..."
                  className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={searching || !query.trim()}
                  className="absolute right-1.5 top-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-medium transition-all"
                >
                  {searching ? 'Querying...' : 'Search'}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <div className="flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-500" />
                  <span>Top-K Chunks:</span>
                  <select
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value))}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-slate-200 text-xs"
                  >
                    <option value={2}>2</option>
                    <option value={4}>4</option>
                    <option value={6}>6</option>
                    <option value={8}>8</option>
                  </select>
                </div>

                <div className="flex items-center space-x-1.5">
                  <span>Type Filter:</span>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-slate-200 text-xs"
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
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}
          </div>

          {/* Search Results Display */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <span>Retrieved Evidence Chunks</span>
              <span>{matches ? `${matches.length} Results` : 'Awaiting Query'}</span>
            </div>

            {searching ? (
              <div className="glass-panel p-12 rounded-2xl text-center text-slate-400 text-xs space-y-2">
                <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mx-auto"></div>
                <p>Computing cosine similarity in pgvector...</p>
              </div>
            ) : matches === null ? (
              <div className="glass-panel p-12 rounded-2xl text-center text-slate-500 text-xs space-y-3">
                <Search className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="max-w-sm mx-auto">
                  Type a technical skill, experience query, or role requirement above to inspect retrieved vector evidence chunks and similarity confidence.
                </p>
              </div>
            ) : matches.length === 0 ? (
              <div className="glass-panel p-12 rounded-2xl text-center text-slate-500 text-xs space-y-2">
                <FileText className="w-8 h-8 text-slate-600 mx-auto" />
                <p>No matching evidence chunks found for this query in the vector store.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => {
                  const scorePercent = Math.round(match.similarity_score * 100);
                  const isHighMatch = scorePercent >= 75;
                  const isMedMatch = scorePercent >= 50;

                  return (
                    <div
                      key={match.chunk_id}
                      className="glass-panel p-5 rounded-2xl space-y-3 border border-slate-800 hover:border-indigo-500/40 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-semibold text-slate-200">
                            {match.document_title}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono">
                            {match.document_type}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold border ${
                            isHighMatch
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : isMedMatch
                              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {scorePercent}% Similarity
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                        {match.content}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
                        <div className="flex items-center space-x-1 text-indigo-400">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
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
