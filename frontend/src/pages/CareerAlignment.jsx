import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getCareerAlignment } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  GitCompare,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  FileText,
  UserCheck
} from 'lucide-react';

export const CareerAlignment = () => {
  const { profile, recommendation, resumeAnalysis, setActiveSection } = useApp();
  const [alignmentData, setAlignmentData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlignment = async () => {
      try {
        setLoading(true);
        const res = await getCareerAlignment();
        if (res.success && res.alignment) {
          setAlignmentData(res.alignment);
        }
      } catch (err) {
        console.error('Failed to load alignment:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlignment();
  }, [profile, recommendation, resumeAnalysis]);

  if (loading) {
    return <LoadingSpinner label="Calculating holistic career alignment..." />;
  }

  if (!alignmentData) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <GitCompare size={40} color="#6366f1" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
          Career Alignment Calibration Incomplete
        </h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
          To compute your holistic 4-way alignment matrix, please complete your profile and generate your career recommendation first.
        </p>
        <button className="btn btn-primary" onClick={() => setActiveSection('guidance')}>
          Complete Profile in Career Guidance <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  const {
    targetCareer,
    overallCareerAlignmentScore,
    profileAlignmentScore,
    skillAlignmentScore,
    resumeAlignmentScore,
    careerReadiness,
    missingRequirements,
    actionableImprovements
  } = alignmentData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Alignment Hero Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.14), rgba(16, 185, 129, 0.1))',
          borderColor: 'rgba(99, 102, 241, 0.3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="tag-chip tag-chip-primary">
                <Sparkles size={14} /> Section 3.11 Career Alignment Engine
              </span>
              <span className="tag-chip tag-chip-success">
                {careerReadiness}
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              Alignment Assessment for {targetCareer}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '620px', marginTop: '4px' }}>
              Triangulating academic profile, technical skill gap, and parsed resume keywords to determine your true hiring viability.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '16px 28px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
              {overallCareerAlignmentScore}%
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Overall Readiness
            </span>
          </div>
        </div>
      </div>

      {/* Triangulation Metrics Deck */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px' }}>
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <UserCheck size={20} color="#6366f1" />
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Profile Alignment</h4>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818cf8', marginBottom: '4px' }}>
            {profileAlignmentScore}%
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Calculated from education, programming background, and career aspirations.
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Award size={20} color="#10b981" />
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Skill Alignment</h4>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginBottom: '4px' }}>
            {skillAlignmentScore}%
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Ratio of verified existing skills against target career core competency list.
          </p>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <FileText size={20} color="#f59e0b" />
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700 }}>Resume Alignment</h4>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: resumeAlignmentScore !== null ? '#fbbf24' : '#64748b', marginBottom: '4px' }}>
            {resumeAlignmentScore !== null ? `${resumeAlignmentScore}%` : 'Upload Needed'}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {resumeAlignmentScore !== null
              ? 'ATS keyword and project density matching target position.'
              : 'Upload your resume in Resume Analyzer to activate ATS scoring.'}
          </p>
        </div>
      </div>

      {/* Missing Requirements & Actionable Improvements Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        <div className="card">
          <h3 className="card-title" style={{ color: '#f87171', marginBottom: '14px' }}>
            <AlertTriangle size={18} /> Missing Career Requirements
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {missingRequirements?.length > 0 ? (
              missingRequirements.map((req, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.86rem',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {req}
                </div>
              ))
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No major missing requirements detected.</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title" style={{ color: '#34d399', marginBottom: '14px' }}>
            <TrendingUp size={18} /> Strategic Improvement Action Items
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {actionableImprovements?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.86rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  gap: '10px'
                }}
              >
                <span style={{ fontWeight: 700, color: '#10b981' }}>#{idx + 1}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

