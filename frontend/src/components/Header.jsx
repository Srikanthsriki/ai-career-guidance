import React from 'react';
import { useApp } from '../context/AppContext';
import { Menu, User, LogOut, Mail } from 'lucide-react';

const sectionTitles = {
  dashboard: { title: 'Career Dashboard', desc: 'Holistic career performance, skill gap overview, and readiness metrics' },
  guidance: { title: 'Career Guidance & Recommendation', desc: 'AI profile assessment, best-fit career match, and alternatives' },
  roadmap: { title: 'Skills & Personalized Roadmap', desc: 'Skill proficiency radar gap analysis and milestone roadmap' },
  resume: { title: 'AI Resume Analyzer', desc: 'PDF & DOCX parsing, ATS compatibility, and alignment advice' },
  interview: { title: 'AI Interview Simulator', desc: 'Live interactive interview practice sessions with AI grading' },
  apex: { title: 'APEX AI Assistant', desc: 'Ask APEX any career question, tech stack query, interview tip, or study guide' },
  alignment: { title: 'Career Alignment Matrix', desc: 'Triangulating profile, resume, skills, and target readiness' },
  progress: { title: 'Progress Tracking', desc: 'Milestone completion and continuous skill tracker' },
  resources: { title: 'Curated Learning Resources', desc: 'Verified courses, official docs, and practice platforms' },
  jobs: { title: 'Jobs & Internships Directory', desc: 'Verified early-career opportunities and portfolio guidelines' },
  analytics: { title: 'Analytics & Visualizations', desc: 'Radar breakdown, milestone bar charts, and performance tracking' },
  report: { title: 'Download Career Report', desc: 'Export comprehensive career portfolio report PDF' }
};

export const Header = ({ onToggleSidebar }) => {
  const { activeSection, profile, currentUser, logoutUserSession } = useApp();
  const current = sectionTitles[activeSection] || { title: 'Career Guidance', desc: 'System' };

  const displayName = currentUser?.name || profile?.name || 'Enrolled Student';
  const displayEmail = currentUser?.email || 'student@gmail.com';

  return (
    <header className="top-header">
      <div className="header-left">
        <button className="menu-toggle-btn" onClick={onToggleSidebar} aria-label="Toggle menu">
          <Menu size={20} />
        </button>
        <div className="header-title">
          <h2>{current.title}</h2>
          <p>{current.desc}</p>
        </div>
      </div>

      <div className="header-right">
        <div className="header-user-group">
          <div className="user-profile-badge" title={displayEmail}>
            <div className="avatar-circle">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{displayName}</span>
              {currentUser?.email && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {currentUser.email}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={logoutUserSession}
            className="logout-icon-btn"
            title="Sign out of student account"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};


