import React from 'react';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Award,
  AlertCircle,
  CheckCircle2,
  Code2,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export const SkillsRoadmap = () => {
  const { recommendation, setActiveSection } = useApp();

  if (!recommendation) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <MapPin size={40} color="#6366f1" style={{ margin: '0 auto 16px' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>
          No Career Recommendation Available Yet
        </h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto 20px', fontSize: '0.9rem' }}>
          Please complete and validate your student profile in the Career Guidance section to view your personalized skills gap analysis and learning roadmap.
        </p>
        <button className="btn btn-primary" onClick={() => setActiveSection('guidance')}>
          Go to Career Guidance <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  const { skillGap, roadmap, recommendedProjects, bestFitCareer } = recommendation;

  // Chart data preparation
  const chartData = [
    ...(skillGap?.existingSkills || []).map(s => ({
      skill: s.skill,
      current: s.currentProficiency || 70,
      required: s.requiredProficiency || 85
    })),
    ...(skillGap?.missingSkills || []).map(s => ({
      skill: s.skill,
      current: 25,
      required: s.requiredProficiency || 80
    }))
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* 3.4 AI Skill-Gap Analysis Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="tag-chip tag-chip-primary">
                <Sparkles size={14} /> AI Skill-Gap Engine
              </span>
              <span className="tag-chip tag-chip-warning">
                Target: {bestFitCareer}
              </span>
            </div>
            <h2 className="card-title">Skill-Gap Analysis</h2>
            <p className="card-subtitle">
              Evaluating your current competencies against target industry expectations.
            </p>
          </div>
        </div>

        {/* Charts & Gap Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          {/* Radar Chart */}
          <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '12px', color: '#a5b4fc' }}>
              Skill Proficiency Radar
            </h4>
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={chartData}>
                  <PolarGrid stroke="#2e384d" />
                  <PolarAngleAxis dataKey="skill" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#2e384d" tick={{ fill: '#64748b', fontSize: 9 }} />
                  <Radar name="Current Proficiency" dataKey="current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                  <Radar name="Required Proficiency" dataKey="required" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '12px', color: '#34d399' }}>
              Proficiency Benchmark Comparison
            </h4>
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="skill" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="current" fill="#6366f1" name="Your Level" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="required" fill="#10b981" name="Required Level" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Existing & Missing Skills Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#34d399', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} /> Verified Existing Skills
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {skillGap?.existingSkills?.map((s, idx) => (
                <div key={idx} style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
                    <span>{s.skill}</span>
                    <span style={{ color: '#34d399' }}>{s.currentProficiency}% / {s.requiredProficiency}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${s.currentProficiency}%`, height: '100%', background: '#10b981' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f87171', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> Priority Missing Skills to Learn
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {skillGap?.missingSkills?.map((m, idx) => (
                <div key={idx} style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{m.skill}</span>
                    <span className="tag-chip tag-chip-warning" style={{ fontSize: '0.72rem' }}>Priority: {m.priority}</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {m.suggestedImprovement}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3.5 Personalized Learning Roadmap */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <MapPin size={20} color="#10b981" /> Personalized Learning Roadmap
            </h2>
            <p className="card-subtitle">
              Structured progressive curriculum from beginner to advanced milestones.
            </p>
          </div>
          <button className="btn btn-secondary" onClick={() => setActiveSection('progress')}>
            Open Checklist Tracker
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {roadmap?.map((stage, sIdx) => (
            <div
              key={sIdx}
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderLeft: `4px solid ${stage.level === 'Beginner' ? '#10b981' : stage.level === 'Intermediate' ? '#6366f1' : '#f59e0b'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="avatar-circle" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>
                    {stage.stageNumber}
                  </span>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{stage.stageTitle}</h3>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="tag-chip tag-chip-primary">{stage.level}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> {stage.estimatedDuration}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginTop: '14px' }}>
                <div>
                  <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Topics to Study</h5>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {stage.topics?.map((t, idx) => (
                      <li key={idx} style={{ marginBottom: '3px' }}>{t}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Practice Activities</h5>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {stage.practiceActivities?.map((a, idx) => (
                      <li key={idx} style={{ marginBottom: '3px' }}>{a}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Milestone Criteria</h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {stage.milestones?.map((m, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#6ee7b7' }}>
                        <CheckCircle2 size={14} /> {m}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3.6 Practical Project Recommendations */}
      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Code2 size={20} color="#06b6d4" /> Recommended Practical Projects
            </h2>
            <p className="card-subtitle">
              Portfolio-worthy engineering projects tailored to your target career and missing skills.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {recommendedProjects?.map((proj, pIdx) => (
            <div
              key={pIdx}
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="tag-chip tag-chip-primary">{proj.difficulty} Level</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Project #{pIdx + 1}</span>
              </div>

              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '8px' }}>{proj.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '14px', flex: 1 }}>
                {proj.description}
              </p>

              <div style={{ marginBottom: '14px' }}>
                <h5 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Technologies:</h5>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {proj.requiredTechnologies?.map((t, idx) => (
                    <span key={idx} className="tag-chip tag-chip-primary" style={{ fontSize: '0.72rem' }}>{t}</span>
                  ))}
                </div>
              </div>

              <div>
                <h5 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Expected Outcomes:</h5>
                <ul style={{ paddingLeft: '18px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {proj.expectedLearningOutcomes?.map((o, idx) => (
                    <li key={idx}>{o}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

