import React, { useState, useEffect } from 'react';
import { getJobOpportunities } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Briefcase,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  Building2,
  MapPin,
  Sparkles,
  Award
} from 'lucide-react';

export const JobsInternships = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await getJobOpportunities();
        if (res.success) {
          setOpportunities(res.opportunities);
        }
      } catch (err) {
        console.error('Failed to load opportunities:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Info Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="tag-chip tag-chip-primary">
                <Briefcase size={14} /> Section 3.14 Opportunity Hub
              </span>
              <span className="tag-chip tag-chip-success">
                <ShieldCheck size={14} /> Legitimate Portals Only
              </span>
            </div>
            <h2 className="card-title">Entry-Level Opportunities & Internship Portals</h2>
            <p className="card-subtitle">
              Verified global university hiring portals and early-career software engineering pipelines. We strictly distinguish authentic recruiting portals from synthetic AI suggestions.
            </p>
          </div>
        </div>

        <div
          style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.03)',
            borderLeft: '4px solid var(--accent-success)',
            fontSize: '0.84rem',
            color: 'var(--text-secondary)'
          }}
        >
          <strong>Hiring Integrity Guarantee:</strong> All listed listings and platforms are direct links to certified enterprise campus recruitment channels (e.g., Google Students, Microsoft University Recruiting, Wellfound Startups, Internshala). Never fake vacancies or AI-invented links.
        </div>
      </div>

      {/* Opportunities Card Grid */}
      {loading ? (
        <LoadingSpinner label="Fetching verified career portals..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
          {opportunities.map((opp, idx) => (
            <div
              key={idx}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="tag-chip tag-chip-primary">
                    <Building2 size={12} /> {opp.organization}
                  </span>
                  <span className="tag-chip tag-chip-success" style={{ fontSize: '0.72rem' }}>
                    {opp.type}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
                  {opp.title}
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <MapPin size={14} /> {opp.location}
                </div>

                <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.45 }}>
                  {opp.description}
                </p>

                <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Candidate Eligibility:
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {opp.eligibility}
                  </p>
                </div>
              </div>

              <a
                href={opp.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: '100%', textDecoration: 'none' }}
              >
                Apply via Official Portal <ExternalLink size={15} />
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Job Preparation & Portfolio Advisory */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '14px' }}>
          <Award size={18} color="#10b981" /> Early Career Engineering Preparation Strategy
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#818cf8', marginBottom: '8px' }}>
              1. GitHub Portfolio Rigor
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Pin 3 production-grade repositories with comprehensive README files, architectural diagrams, test suites, and live demo URLs.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#34d399', marginBottom: '8px' }}>
              2. Technical Assessment Prep
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Practice core data structures (arrays, trees, graphs) and dynamic programming problems on LeetCode/NeetCode 150.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b', marginBottom: '8px' }}>
              3. System Design Intuition
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Understand fundamental tradeoffs: SQL vs NoSQL, caching with Redis, load balancing, and horizontal scaling.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

