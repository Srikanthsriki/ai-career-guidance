import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Notification } from './components/Notification';
import { AuthPage } from './pages/AuthPage';
import { ErrorBoundary } from './components/ErrorBoundary';

// 13 Navigation Pages
import { Dashboard } from './pages/Dashboard';
import { CareerGuidance } from './pages/CareerGuidance';
import { SkillsRoadmap } from './pages/SkillsRoadmap';
import { ResumeAnalyzer } from './pages/ResumeAnalyzer';
import { InterviewSimulator } from './pages/InterviewSimulator';
import { CareerAlignment } from './pages/CareerAlignment';
import { ProgressTracking } from './pages/ProgressTracking';
import { LearningResources } from './pages/LearningResources';
import { JobsInternships } from './pages/JobsInternships';
import { ApexChat } from './pages/ApexChat';
import { ApexWidget } from './components/ApexWidget';
import { Analytics } from './pages/Analytics';
import { CareerReport } from './pages/CareerReport';

export function App() {
  const { activeSection, currentUser } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If student is not logged in, show student login & registration portal
  if (!currentUser) {
    return (
      <ErrorBoundary>
        <div className="auth-portal-wrapper">
          <AuthPage />
          <Notification />
        </div>
      </ErrorBoundary>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'guidance':
        return <CareerGuidance />;
      case 'roadmap':
        return <SkillsRoadmap />;
      case 'resume':
        return <ResumeAnalyzer />;
      case 'interview':
        return <InterviewSimulator />;
      case 'alignment':
        return <CareerAlignment />;
      case 'progress':
        return <ProgressTracking />;
      case 'resources':
        return <LearningResources />;
      case 'jobs':
        return <JobsInternships />;
      case 'apex':
        return <ApexChat />;
      case 'analytics':
        return <Analytics />;
      case 'report':
        return <CareerReport />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="app-container">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="main-wrapper">
          <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          <main className="content-area">
            <ErrorBoundary>
              {renderSection()}
            </ErrorBoundary>
          </main>
        </div>

        {/* Global Floating APEX AI Assistant */}
        <ApexWidget />

        <Notification />
      </div>
    </ErrorBoundary>
  );
}

export default App;

