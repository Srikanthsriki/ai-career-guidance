import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { registerUser } from '../services/api';
import {
  Sparkles,
  Mail,
  User,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  Zap
} from 'lucide-react';

export const AuthPage = () => {
  const { loginUserSession, refreshAll } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim();

    if (!cleanName) {
      setError('Please enter your full name.');
      return;
    }

    if (!cleanEmail) {
      setError('Please enter your Gmail / Email address.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please enter a valid Gmail address (e.g., student@gmail.com).');
      return;
    }

    try {
      setLoading(true);
      const res = await registerUser({
        name: cleanName,
        email: cleanEmail
      });

      if (res.success && res.user) {
        setSuccessMsg(`Welcome, ${res.user.name}! Opening your career portal...`);
        setTimeout(async () => {
          loginUserSession(res.user);
          await refreshAll();
        }, 500);
      } else {
        setError(res.error || 'Failed to sign in.');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Connection error. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Fast Demo Student Access for academic evaluation
  const handleQuickDemo = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await registerUser({
        name: 'Alex Vance (Student)',
        email: 'alex.student@gmail.com'
      });
      if (res.success && res.user) {
        loginUserSession(res.user);
        await refreshAll();
      } else {
        setError('Could not initialize demo student account.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Background ambient glow */}
      <div className="auth-ambient-glow" />

      <div className="auth-card">
        {/* Header Branding */}
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Sparkles size={28} color="#818cf8" />
          </div>
          <h1 className="auth-title">PathFinder AI</h1>
          <p className="auth-subtitle">AI Career Guidance & Advisory Portal</p>
          <div className="auth-tag">
            <ShieldCheck size={14} color="#34d399" />
            <span>Student Login & Registration</span>
          </div>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="auth-alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="auth-alert success">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Direct Name & Gmail Form (No Password Needed) */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Student Name
            </label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                name="name"
                placeholder="Enter your full name (e.g., Rahul Sharma)"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Gmail / Email Address
            </label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="yourname@gmail.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner" />
            ) : (
              <>
                <span>Enter Career Guidance System</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>QUICK EVALUATION ACCESS</span>
        </div>

        {/* Fast 1-Click Access for Evaluators */}
        <button
          type="button"
          onClick={handleQuickDemo}
          disabled={loading}
          className="demo-quick-btn"
        >
          <Zap size={16} color="#f59e0b" />
          <span>⚡ 1-Click Demo Student Access (Explore System)</span>
        </button>

        {/* Footer */}
        <div className="auth-footer">
          <GraduationCap size={15} color="var(--text-muted)" />
          <span>AI Career Guidance System • Student Access Portal</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
