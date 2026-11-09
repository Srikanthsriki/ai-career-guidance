import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getLearningResources } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  BookOpen,
  ExternalLink,
  CheckCircle2,
  Filter,
  Search,
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';

export const LearningResources = () => {
  const { recommendation } = useApp();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  const [careerFilter, setCareerFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const params = {};
        if (careerFilter !== 'All') params.career = careerFilter;
        if (typeFilter !== 'All') params.type = typeFilter;
        const res = await getLearningResources(params);
        if (res.success) {
          setResources(res.resources);
        }
      } catch (err) {
        console.error('Failed to load resources:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, [careerFilter, typeFilter]);

  const filtered = resources.filter(r => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      r.title.toLowerCase().includes(term) ||
      r.skill.toLowerCase().includes(term) ||
      r.provider.toLowerCase().includes(term) ||
      r.description.toLowerCase().includes(term)
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Info Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="tag-chip tag-chip-primary">
                <BookOpen size={14} /> Section 3.13 Verified Resource Directory
              </span>
              <span className="tag-chip tag-chip-success">
                <CheckCircle2 size={14} /> 100% Verified External Links
              </span>
            </div>
            <h2 className="card-title">Curated Learning Resources & Documentation</h2>
            <p className="card-subtitle">
              Verified tutorials, university courses, and official developer documentation organized by track. Strictly distinguished from AI suggestions.
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div>
            <label className="form-label">Search by Skill or Title</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. React, Python, Docker..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="form-label">Filter by Career Track</label>
            <select
              className="form-select"
              value={careerFilter}
              onChange={(e) => setCareerFilter(e.target.value)}
            >
              <option value="All">All Tracks</option>
              <option value="Full Stack Web Development">Full Stack Web Development</option>
              <option value="AI & Machine Learning Engineer">AI & Machine Learning Engineer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="Cloud & DevOps Engineer">Cloud & DevOps Engineer</option>
              <option value="Cybersecurity Specialist">Cybersecurity Specialist</option>
            </select>
          </div>

          <div>
            <label className="form-label">Filter by Resource Format</label>
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Formats</option>
              <option value="Course">University / Video Course</option>
              <option value="Documentation">Official Documentation & Specs</option>
              <option value="Interactive">Interactive Coding Curriculum</option>
              <option value="Hands-on">Hands-on Labs & Practice</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources Card Grid */}
      {loading ? (
        <LoadingSpinner label="Retrieving verified learning resources..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {filtered.map((r, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="tag-chip tag-chip-success">
                    <CheckCircle2 size={12} /> Verified Provider: {r.provider}
                  </span>
                  <span className="tag-chip tag-chip-primary" style={{ fontSize: '0.72rem' }}>
                    {r.isFree ? 'Free Access' : 'Audit Available'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>
                  {r.title}
                </h3>
                <div style={{ fontSize: '0.8rem', color: '#818cf8', marginBottom: '10px', fontWeight: 500 }}>
                  Career: {r.career}
                </div>

                <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.45 }}>
                  {r.description}
                </p>

                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Focus Skills Covered:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {r.skill.split(',').map((s, sIdx) => (
                      <span key={sIdx} className="tag-chip" style={{ fontSize: '0.72rem' }}>{s.trim()}</span>
                    ))}
                  </div>
                </div>
              </div>

              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ width: '100%', textDecoration: 'none' }}
              >
                Open Resource <ExternalLink size={15} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

