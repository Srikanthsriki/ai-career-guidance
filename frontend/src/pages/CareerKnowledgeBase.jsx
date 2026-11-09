import React, { useState, useEffect } from 'react';
import { queryRAGKnowledge, getKnowledgeDocuments } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Database,
  Search,
  BookOpen,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles
} from 'lucide-react';

export const CareerKnowledgeBase = () => {
  const [query, setQuery] = useState('');
  const [ragResult, setRagResult] = useState(null);
  const [searching, setSearching] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [docLoading, setDocLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        setDocLoading(true);
        const res = await getKnowledgeDocuments();
        if (res.success) {
          setDocuments(res.documents || []);
          if (res.documents && res.documents.length > 0) {
            setSelectedDoc(res.documents[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load documents:', err);
      } finally {
        setDocLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() || searching) return;

    setSearching(true);
    setRagResult(null);
    try {
      const res = await queryRAGKnowledge(query.trim());
      if (res.success) {
        setRagResult(res.data);
      }
    } catch (err) {
      console.error('RAG query failed:', err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Search Header Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="tag-chip tag-chip-primary">
                <Database size={14} /> Section 3.15 RAG Knowledge Retrieval
              </span>
              <span className="tag-chip tag-chip-success">
                <ShieldCheck size={14} /> Grounded Citations Only
              </span>
            </div>
            <h2 className="card-title">Retrieval-Augmented Career Knowledge Base</h2>
            <p className="card-subtitle">
              Ask any career or technical curriculum question. The RAG pipeline queries our verified vector repository and synthesizes an answer citing only authoritative sources.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. What are the core architectural skills expected of a Full Stack Developer or AI Engineer?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={searching || !query.trim()}>
            {searching ? <LoadingSpinner label="Searching..." /> : (
              <>
                <Search size={16} /> Search with RAG
              </>
            )}
          </button>
        </form>

        {/* Suggested Queries */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Sample queries:</span>
          {["Full stack engineering standards", "AI and machine learning prerequisites", "DevOps and cloud SRE practices", "Cybersecurity and OWASP guidelines"].map((q, idx) => (
            <button
              key={idx}
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              onClick={() => setQuery(q)}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* RAG Query Result Card */}
      {ragResult && (
        <div className="card" style={{ border: '1px solid rgba(99, 102, 241, 0.4)' }}>
          <div className="card-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="tag-chip tag-chip-primary">
                  <Sparkles size={14} /> Synthesized RAG Response
                </span>
                {ragResult.hasSufficientContext ? (
                  <span className="tag-chip tag-chip-success">Context Grounded</span>
                ) : (
                  <span className="tag-chip tag-chip-warning">Context Insufficient</span>
                )}
              </div>
              <h3 className="card-title">Query Response</h3>
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-input)',
              fontSize: '0.92rem',
              lineHeight: 1.6,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
              marginBottom: '20px'
            }}
          >
            {ragResult.answer}
          </div>

          {/* Citations Box */}
          {ragResult.citations?.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#818cf8', marginBottom: '10px' }}>
                Grounded Document Citations:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                {ragResult.citations.map((c, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.82rem'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      [Source {idx + 1}]: {c.title}
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Published by: {c.sourceName}
                    </div>
                    {c.sourceUrl && (
                      <a
                        href={c.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        Inspect Reference Document <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Document Library Browser */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <BookOpen size={18} color="#10b981" /> Indexed Career Knowledge Library
            </h3>
            <p className="card-subtitle">
              Explore the curated domain documents stored and indexed in the knowledge base.
            </p>
          </div>
        </div>

        {docLoading ? (
          <LoadingSpinner label="Loading knowledge documents..." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {documents.map((doc, idx) => {
                const isSelected = selectedDoc?._id === doc._id || selectedDoc?.title === doc.title;
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDoc(doc)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--radius-sm)',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-input)',
                      border: `1px solid ${isSelected ? 'rgba(99, 102, 241, 0.4)' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: isSelected ? '#a5b4fc' : 'var(--text-primary)' }}>
                      {doc.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Category: {doc.careerCategory}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Document Full View */}
            {selectedDoc && (
              <div
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="tag-chip tag-chip-primary">{selectedDoc.careerCategory}</span>
                  <span className="tag-chip tag-chip-success">Verified Document</span>
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>{selectedDoc.title}</h3>

                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Source: <strong>{selectedDoc.sourceName}</strong>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', maxHeight: '350px', overflowY: 'auto' }}>
                  {selectedDoc.content}
                </div>

                {selectedDoc.sourceUrl && (
                  <a
                    href={selectedDoc.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ alignSelf: 'flex-start', marginTop: '10px' }}
                  >
                    Visit Source Authority <ExternalLink size={14} />
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

