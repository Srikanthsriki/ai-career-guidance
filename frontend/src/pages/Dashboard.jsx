import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getAnalyticsSummary, getDatabaseStatus, seedDatabase, exportDatabase } from '../services/api';
import { StatCard } from '../components/StatCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Compass,
  MapPin,
  FileText,
  Mic,
  Award,
  TrendingUp,
  ArrowRight,
  Sparkles,
  BookOpen,
  Database,
  Server,
  HardDrive,
  Download,
  RefreshCw,
  Bot
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

export const Dashboard = () => {
  const { setActiveSection, profile, recommendation, resumeAnalysis, refreshAll, showToast } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState(null);
  const [seeding, setSeeding] = useState(false);

  const fetchDbStatus = async () => {
    try {
      const res = await getDatabaseStatus();
      if (res.success) {
        setDbStatus(res);
      }
    } catch (e) {
      console.warn('DB status error:', e.message);
    }
  };

  useEffect(() => {
    fetchDbStatus();
  }, []);

  const handleSeed = async () => {
    try {
      setSeeding(true);
      const res = await seedDatabase();
      if (res.success) {
        showToast('Self-contained database seeded with college demo records!', 'success');
        refreshAll();
        fetchDbStatus();
      }
    } catch (e) {
      showToast('Database seed failed.', 'error');
    } finally {
      setSeeding(false);
    }
  };

  const handleExport = async () => {
    try {
      const res = await exportDatabase();
      if (res.success) {
        const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.backup, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", jsonStr);
        downloadAnchor.setAttribute("download", "career_database_backup.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('Complete database JSON exported!', 'success');
      }
    } catch (e) {
      showToast('Export failed.', 'error');
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await getAnalyticsSummary();
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Analytics load error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [profile, recommendation, resumeAnalysis]);

  if (loading) {
    return <LoadingSpinner label="Compiling live career analytics..." />;
  }

  const matchScore = data?.careerMatchScore ? `${data.careerMatchScore}%` : 'Not Evaluated';
  const bestCareer = data?.recommendedCareer || 'Profile Incomplete';
  const progressPercent = data?.roadmapProgress !== undefined ? `${data.roadmapProgress}%` : '0%';
  const resumeScoreVal = data?.resumeScore !== null && data?.resumeScore !== undefined ? `${data.resumeScore}/100` : 'Pending Upload';
  const interviewVal = data?.interviewScore !== null && data?.interviewScore !== undefined ? `${data.interviewScore}%` : 'Pending Interview';
  const readinessVal = data?.overallReadiness ? `${data.overallReadiness}%` : '0%';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Hero Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.1))',
          borderColor: 'rgba(99, 102, 241, 0.3)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="tag-chip tag-chip-primary">
              <Sparkles size={14} /> AI-Powered Career Platform
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Intelligent Guidance & APEX AI Assistant</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            Welcome back, {data?.studentName || 'Student'}!
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '6px', maxWidth: '650px', fontSize: '0.92rem' }}>
            {data?.hasProfile
              ? `Your current primary match is ${bestCareer}. Complete roadmap milestones, test your interview responses, and upload your resume to reach 100% career readiness.`
              : 'Start by filling in your student profile in Career Guidance to receive personalized recommendations, skill gap analysis, and learning roadmaps.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {!data?.hasProfile ? (
            <button className="btn btn-primary" onClick={() => setActiveSection('guidance')}>
              Complete Profile <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button className="btn btn-primary" onClick={() => setActiveSection('roadmap')}>
                View Roadmap <MapPin size={16} />
              </button>
              <button className="btn btn-secondary" onClick={() => setActiveSection('report')}>
                Download PDF <Award size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Real-time KPI Stats Grid */}
      <div className="stats-grid">
        <StatCard
          icon={Compass}
          title="Career Match Score"
          value={matchScore}
          subtitle={bestCareer}
          color="#6366f1"
        />
        <StatCard
          icon={TrendingUp}
          title="Roadmap Progress"
          value={progressPercent}
          subtitle={`${data?.completedMilestones || 0} milestones done`}
          color="#10b981"
        />
        <StatCard
          icon={FileText}
          title="Resume Score"
          value={resumeScoreVal}
          subtitle="ATS Alignment Score"
          color="#f59e0b"
        />
        <StatCard
          icon={Mic}
          title="Interview Rating"
          value={interviewVal}
          subtitle="AI Mock Interview Score"
          color="#06b6d4"
        />
      </div>

      {/* Recharts Analytics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Radar Skill Gap Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Award size={18} color="#6366f1" /> Skill Gap Matrix
              </h3>
              <p className="card-subtitle">Your current proficiency vs target career requirement</p>
            </div>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => setActiveSection('roadmap')}>
              Details
            </button>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data?.radarSkills || []}>
                <PolarGrid stroke="#2e384d" />
                <PolarAngleAxis dataKey="skill" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#2e384d" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar
                  name="Student Proficiency"
                  dataKey="studentProficiency"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.45}
                />
                <Radar
                  name="Required Proficiency"
                  dataKey="requiredProficiency"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.15}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Roadmap Stage Completion Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <MapPin size={18} color="#10b981" /> Roadmap Milestone Completion
              </h3>
              <p className="card-subtitle">Progress across structured learning phases</p>
            </div>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => setActiveSection('progress')}>
              Update Tasks
            </button>
          </div>

          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.roadmapStages || []}>
                <XAxis dataKey="stageName" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="completed" fill="#10b981" name="Completed Tasks" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" fill="#374151" name="Total Required" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Access Action Deck */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '16px' }}>
          <Sparkles size={18} color="#a855f7" /> Recommended Action Deck
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer'
            }}
            onClick={() => setActiveSection('resume')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <FileText size={18} color="#f59e0b" />
              <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Analyze Resume</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Upload your PDF/DOCX resume to detect ATS formatting, extracted skills, and keyword alignment.
            </p>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer'
            }}
            onClick={() => setActiveSection('interview')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Mic size={18} color="#06b6d4" />
              <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Mock Interview Room</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Simulate technical and behavioral interviews with real-time AI scoring and answer feedback.
            </p>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer'
            }}
            onClick={() => setActiveSection('apex')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <Bot size={18} color="#6366f1" />
              <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Chat with APEX AI</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Ask APEX any career question, tech stack query, interview tip, or study guide.
            </p>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-color)',
              cursor: 'pointer'
            }}
            onClick={() => setActiveSection('roadmap')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <MapPin size={18} color="#10b981" />
              <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Personalized Roadmap</h4>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Follow your personalized milestone-based learning plan from beginner to industry-ready.
            </p>
          </div>
        </div>
      </div>

      {/* Database Engine & REST API Inspector Card */}
      <div className="card" style={{ border: '1px solid rgba(99, 102, 241, 0.35)' }}>
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="tag-chip tag-chip-primary">
                <Database size={14} /> Self-Contained Database & REST API
              </span>
              <span className="tag-chip tag-chip-success">
                {dbStatus?.activeEngine || 'Custom Persistent FileDB Engine'}
              </span>
            </div>
            <h3 className="card-title">Live Database Collections & Storage Status</h3>
            <p className="card-subtitle">
              Persistent NoSQL JSON document store stored locally in <code>backend/database/</code> with disk persistence across server restarts.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              onClick={handleSeed}
              disabled={seeding}
            >
              <RefreshCw size={14} /> {seeding ? 'Seeding...' : 'Seed Sample Database'}
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              onClick={handleExport}
            >
              <Download size={14} /> Export Database Backup
            </button>
          </div>
        </div>

        {/* Collections Overview Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {dbStatus?.details?.collections && Object.entries(dbStatus.details.collections).map(([colName, colData]) => (
            <div
              key={colName}
              style={{
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'capitalize', color: '#818cf8' }}>
                  {colName}
                </span>
                <span className="tag-chip tag-chip-success" style={{ fontSize: '0.7rem' }}>
                  {colData.recordCount} docs
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                File: {colName}.json ({(colData.fileSizeBytes / 1024).toFixed(1)} KB)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

