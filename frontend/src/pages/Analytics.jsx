import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getAnalyticsSummary } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatCard } from '../components/StatCard';
import {
  BarChart3,
  TrendingUp,
  Award,
  Compass,
  FileText,
  Mic,
  PieChart as PieIcon,
  Layers
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
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const Analytics = () => {
  const { profile, recommendation, resumeAnalysis } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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
    return <LoadingSpinner label="Compiling comprehensive statistical dashboards..." />;
  }

  const readinessBreakdown = [
    { name: 'Profile Match', value: data?.careerMatchScore || 0, color: '#6366f1' },
    { name: 'Roadmap Completion', value: data?.roadmapProgress || 0, color: '#10b981' },
    { name: 'Resume Alignment', value: data?.resumeScore || 0, color: '#f59e0b' },
    { name: 'Mock Interview', value: data?.interviewScore || 0, color: '#06b6d4' }
  ].filter(item => item.value > 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Overview Stat Cards */}
      <div className="stats-grid">
        <StatCard
          icon={Compass}
          title="Career Compatibility"
          value={data?.careerMatchScore ? `${data.careerMatchScore}%` : 'N/A'}
          subtitle={data?.recommendedCareer}
          color="#6366f1"
        />
        <StatCard
          icon={TrendingUp}
          title="Milestone Completion"
          value={data?.roadmapProgress !== undefined ? `${data.roadmapProgress}%` : '0%'}
          subtitle={`${data?.completedMilestones || 0} milestones certified`}
          color="#10b981"
        />
        <StatCard
          icon={FileText}
          title="Resume Score"
          value={data?.resumeScore !== null && data?.resumeScore !== undefined ? `${data.resumeScore}%` : 'Pending'}
          subtitle="ATS Evaluation"
          color="#f59e0b"
        />
        <StatCard
          icon={Award}
          title="Holistic Readiness"
          value={data?.overallReadiness ? `${data.overallReadiness}%` : '35%'}
          subtitle="4-Pillar Weighted Score"
          color="#a855f7"
        />
      </div>

      {/* Recharts Data Visualization Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        {/* Radar Chart: Skills vs Industry Requirement */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <BarChart3 size={18} color="#6366f1" /> Skill Competency Radar
              </h3>
              <p className="card-subtitle">
                Current student capability vs target career standard
              </p>
            </div>
          </div>
          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data?.radarSkills || []}>
                <PolarGrid stroke="#2e384d" />
                <PolarAngleAxis dataKey="skill" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#2e384d" tick={{ fill: '#64748b', fontSize: 10 }} />
                <Radar name="Student Proficiency" dataKey="studentProficiency" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <Radar name="Target Requirement" dataKey="requiredProficiency" stroke="#10b981" fill="#10b981" fillOpacity={0.15} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Roadmap Stages Progress */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <TrendingUp size={18} color="#10b981" /> Milestone Stage Breakdown
              </h3>
              <p className="card-subtitle">
                Completed vs total required milestones across learning roadmap
              </p>
            </div>
          </div>
          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.roadmapStages || []}>
                <XAxis dataKey="stageName" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="completed" fill="#10b981" name="Completed Tasks" radius={[4, 4, 0, 0]} />
                <Bar dataKey="total" fill="#374151" name="Required Milestones" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie/Donut Chart: Readiness Pillars */}
        {readinessBreakdown.length > 0 && (
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header">
              <div>
                <h3 className="card-title">
                  <PieIcon size={18} color="#f59e0b" /> Holistic Readiness Weight Distribution
                </h3>
                <p className="card-subtitle">
                  Contribution of individual pillars to total student career readiness
                </p>
              </div>
            </div>
            <div style={{ width: '100%', height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={readinessBreakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={5}
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {readinessBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

