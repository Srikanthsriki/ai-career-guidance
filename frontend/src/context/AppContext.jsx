import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLatestProfile, getLatestRecommendation, getLatestResumeAnalysis, getAnalyticsSummary } from '../services/api';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('student_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [activeSection, setActiveSection] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const loginUserSession = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('student_user', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    showToast(`Welcome back, ${user.name}!`, 'success');
    refreshAll();
  };

  const logoutUserSession = () => {
    setCurrentUser(null);
    setProfile(null);
    setRecommendation(null);
    setResumeAnalysis(null);
    setAnalytics(null);
    try {
      localStorage.removeItem('student_user');
    } catch (e) {
      console.error(e);
    }
    showToast('Logged out successfully.', 'info');
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const refreshAll = async () => {
    try {
      setLoading(true);
      const [profRes, recRes, resRes, anaRes] = await Promise.allSettled([
        getLatestProfile(),
        getLatestRecommendation(),
        getLatestResumeAnalysis(),
        getAnalyticsSummary()
      ]);

      if (profRes.status === 'fulfilled' && profRes.value?.success) {
        setProfile(profRes.value.profile || null);
      } else {
        setProfile(null);
      }

      if (recRes.status === 'fulfilled' && recRes.value?.success) {
        setRecommendation(recRes.value.data || null);
      } else {
        setRecommendation(null);
      }

      if (resRes.status === 'fulfilled' && resRes.value?.success) {
        setResumeAnalysis(resRes.value.data || null);
      } else {
        setResumeAnalysis(null);
      }

      if (anaRes.status === 'fulfilled' && anaRes.value?.success) {
        setAnalytics(anaRes.value.data || null);
      } else {
        setAnalytics(null);
      }
    } catch (err) {
      console.warn('Initial data refresh notice:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        loginUserSession,
        logoutUserSession,
        activeSection,
        setActiveSection,
        profile,
        setProfile,
        recommendation,
        setRecommendation,
        resumeAnalysis,
        setResumeAnalysis,
        analytics,
        setAnalytics,
        loading,
        setLoading,
        toast,
        showToast,
        refreshAll
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

