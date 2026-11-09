import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getProgress, updateProgressTask } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  CheckCircle2,
  Circle,
  MapPin,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const ProgressTracking = () => {
  const { recommendation, showToast, setActiveSection } = useApp();
  const career = recommendation?.bestFitCareer || 'Full Stack Web Developer';

  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingTaskId, setTogglingTaskId] = useState(null);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const res = await getProgress(career);
      if (res.success) {
        setProgressData(res.progress);
      }
    } catch (err) {
      console.error('Failed to load progress:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [career]);

  const handleToggle = async (taskId, taskTitle, stageNumber, currentCompleted) => {
    setTogglingTaskId(taskId);
    try {
      const res = await updateProgressTask({
        career,
        taskId,
        taskTitle,
        stageNumber,
        completed: !currentCompleted
      });
      if (res.success) {
        setProgressData(res.progress);
        showToast(`Milestone "${taskTitle}" status updated!`, 'success');
      }
    } catch (err) {
      showToast('Failed to update task progress.', 'error');
    } finally {
      setTogglingTaskId(null);
    }
  };

  if (loading && !progressData) {
    return <LoadingSpinner label="Loading roadmap progress tracker..." />;
  }

  const roadmapStages = recommendation?.roadmap || [
    {
      stageNumber: 1,
      stageTitle: "Foundations & Prerequisites",
      milestones: ["Version Control Mastery", "Core Syntax Certification", "Algorithmic Problem Solving"]
    },
    {
      stageNumber: 2,
      stageTitle: "Frameworks & Applied Tooling",
      milestones: ["Component Architecture", "REST API Development", "Database Schema Design"]
    },
    {
      stageNumber: 3,
      stageTitle: "Production Capstone & Deployment",
      milestones: ["Docker Containerization", "Automated CI/CD Pipeline", "Live Cloud Deployment"]
    }
  ];

  // Dynamic chart data for progress over milestones
  const overallPercent = progressData?.overallProgressPercent || 0;
  const areaChartData = [
    { checkpoint: 'Start', progress: 0 },
    { checkpoint: 'Stage 1', progress: Math.min(overallPercent, 35) },
    { checkpoint: 'Stage 2', progress: Math.min(overallPercent, 70) },
    { checkpoint: 'Stage 3 (Target)', progress: overallPercent }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Overview Progress Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(99, 102, 241, 0.08))',
          borderColor: 'rgba(16, 185, 129, 0.35)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="tag-chip tag-chip-success">
                <CheckCircle2 size={14} /> Section 3.12 Progress Tracker
              </span>
              <span className="tag-chip tag-chip-primary">
                Career Track: {career}
              </span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
              Roadmap Milestone & Task Completion
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', marginTop: '4px' }}>
              Mark completed milestones as you advance through each stage of your learning curriculum. Progress is saved directly to MongoDB.
            </p>
          </div>

          <div style={{ textAlign: 'center', padding: '16px 28px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
              {overallPercent}%
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Overall Completion
            </span>
          </div>
        </div>
      </div>

      {/* Trajectory Area Chart */}
      <div className="card">
        <h3 className="card-title" style={{ marginBottom: '14px' }}>
          <TrendingUp size={18} color="#10b981" /> Milestone Velocity & Readiness Trajectory
        </h3>
        <div style={{ width: '100%', height: '220px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaChartData}>
              <defs>
                <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="checkpoint" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }} />
              <Area type="monotone" dataKey="progress" stroke="#10b981" fillOpacity={1} fill="url(#progressGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Interactive Milestone Checklists by Stage */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {roadmapStages.map((stage) => {
          const stageMilestones = stage.milestones || [];
          return (
            <div key={stage.stageNumber} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <span className="avatar-circle" style={{ width: '28px', height: '28px', fontSize: '0.8rem' }}>
                  {stage.stageNumber}
                </span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  Stage {stage.stageNumber}: {stage.stageTitle}
                </h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stageMilestones.map((m, mIdx) => {
                  const taskId = `s${stage.stageNumber}-m${mIdx + 1}`;
                  const isDone = (progressData?.completedMilestones || []).includes(m) ||
                    Boolean((progressData?.completedTasks || []).find(t => t.taskId === taskId && t.completed));

                  return (
                    <div
                      key={taskId}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-sm)',
                        background: isDone ? 'rgba(16, 185, 129, 0.07)' : 'var(--bg-input)',
                        border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-color)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => handleToggle(taskId, m, stage.stageNumber, isDone)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {isDone ? (
                          <CheckCircle2 size={20} color="#10b981" />
                        ) : (
                          <Circle size={20} color="#64748b" />
                        )}
                        <span style={{ fontSize: '0.9rem', fontWeight: isDone ? 600 : 400, textDecoration: isDone ? 'none' : 'none', color: isDone ? '#6ee7b7' : 'var(--text-primary)' }}>
                          {m}
                        </span>
                      </div>

                      <span className="tag-chip" style={{ fontSize: '0.72rem' }}>
                        {isDone ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

