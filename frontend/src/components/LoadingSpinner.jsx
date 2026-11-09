import React from 'react';

export const LoadingSpinner = ({ label = 'Processing...' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '12px' }}>
      <div className="loading-spinner" style={{ width: '32px', height: '32px', borderWidth: '3px' }} />
      <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  );
};

