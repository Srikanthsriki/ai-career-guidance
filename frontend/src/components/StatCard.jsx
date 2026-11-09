import React from 'react';

export const StatCard = ({ icon: Icon, title, value, subtitle, color = '#6366f1', badge = null }) => {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: `${color}20`, color }}>
        <Icon size={24} />
      </div>
      <div className="stat-info" style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p>{title}</p>
          {badge && <span className="tag-chip" style={{ fontSize: '0.7rem' }}>{badge}</span>}
        </div>
        <h3 style={{ color: 'var(--text-primary)', marginTop: '2px' }}>{value}</h3>
        {subtitle && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{subtitle}</span>}
      </div>
    </div>
  );
};

