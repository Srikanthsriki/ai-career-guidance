import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Compass,
  MapPin,
  FileText,
  Mic,
  GitCompare,
  CheckCircle2,
  BookOpen,
  Briefcase,
  Bot,
  Database,
  BarChart3,
  Download,
  X,
  Sparkles,
  LogOut
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'guidance', label: 'Career Guidance', icon: Compass },
  { id: 'roadmap', label: 'Skills & Roadmap', icon: MapPin },
  { id: 'resume', label: 'Resume Analyzer', icon: FileText },
  { id: 'interview', label: 'Interview Simulator', icon: Mic },
  { id: 'apex', label: 'APEX AI Assistant', icon: Bot, badge: 'AI' },
  { id: 'alignment', label: 'Career Alignment', icon: GitCompare },
  { id: 'progress', label: 'Progress Tracking', icon: CheckCircle2 },
  { id: 'resources', label: 'Learning Resources', icon: BookOpen },
  { id: 'jobs', label: 'Jobs & Internships', icon: Briefcase },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'report', label: 'Download Report', icon: Download }
];

export const Sidebar = ({ isOpen, onClose }) => {
  const { activeSection, setActiveSection, recommendation, currentUser, logoutUserSession } = useApp();

  const handleSelect = (id) => {
    setActiveSection(id);
    if (onClose) onClose();
  };

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <Sparkles size={22} />
        </div>
        <div className="brand-text">
          <h1>PathFinder AI</h1>
          <span>AI Career Guidance</span>
        </div>
        {isOpen && (
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <div
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => handleSelect(item.id)}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </div>
          );
        })}
      </nav>

      <div
        style={{
          marginTop: 'auto',
          padding: '16px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.78rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        {recommendation?.bestFitCareer && (
          <div>
            <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Target Career:</div>
            <div style={{ fontWeight: 600, color: '#818cf8' }}>{recommendation.bestFitCareer}</div>
            <div style={{ color: '#34d399', marginTop: '2px' }}>
              Match: {recommendation.matchScore}%
            </div>
          </div>
        )}

        {currentUser && (
          <div style={{ paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {currentUser.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {currentUser.email}
                </div>
              </div>
              <button
                onClick={logoutUserSession}
                title="Sign Out"
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  borderRadius: '6px',
                  padding: '5px 8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

