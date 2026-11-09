import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { uploadAndAnalyzeResume } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  TrendingUp,
  Briefcase
} from 'lucide-react';

export const ResumeAnalyzer = () => {
  const { resumeAnalysis, setResumeAnalysis, recommendation, showToast, setActiveSection } = useApp();
  const [file, setFile] = useState(null);
  const [targetCareer, setTargetCareer] = useState(recommendation?.bestFitCareer || 'Full Stack Web Developer');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleLoadSampleResume = (type) => {
    let sampleContent = '';
    let fileName = '';

    if (type === 'fullstack') {
      fileName = 'alex_johnson_fullstack_resume.pdf';
      sampleContent = `%PDF-1.4
ALEX JOHNSON - FULL STACK SOFTWARE ENGINEER
Email: alex.johnson@example.edu | GitHub: github.com/alexj-dev | Portfolio: alexjohnson.dev
EDUCATION:
Bachelor of Technology in Computer Science & Engineering (2021 - 2025)
State Technological University - GPA: 8.8 / 10.0
TECHNICAL SKILLS:
Languages: JavaScript (ES6+), TypeScript, Python, HTML5, CSS3, SQL
Frameworks: React.js, Node.js, Express.js, Redux Toolkit, Tailwind CSS
Databases & Cloud: MongoDB, PostgreSQL, Docker, AWS (S3, EC2), Git, REST APIs
PROJECTS:
1. Enterprise E-Commerce Platform (React, Node.js, MongoDB, Docker)
- Architected full-stack web application supporting JWT authentication, shopping cart, and Stripe payment gateway.
- Optimized database indexing in MongoDB, decreasing query latency by 35%. Deployed via Docker containers.
2. Real-Time Collaborative Document Workspace (React, WebSockets, Express)
- Built concurrent document editing platform utilizing WebSockets and OT algorithms for real-time sync.
EXPERIENCE:
Software Engineering Intern - CloudCraft Systems (June 2024 - Aug 2024)
- Developed RESTful API endpoints in Node.js and integrated React user components.
- Participated in daily Agile standups, wrote Jest unit tests with 85% coverage.`;
    } else {
      fileName = 'priya_sharma_ai_resume.pdf';
      sampleContent = `%PDF-1.4
PRIYA SHARMA - AI & MACHINE LEARNING ENGINEER
Email: priya.sharma@example.edu | LinkedIn: linkedin.com/in/priyasharma-ai | GitHub: github.com/priyasharma
EDUCATION:
Bachelor of Technology in Artificial Intelligence & Data Science (2022 - 2026)
Institute of Information Technology - GPA: 9.1 / 10.0
TECHNICAL SKILLS:
Core: Python, PyTorch, Scikit-Learn, TensorFlow, Pandas, NumPy, SQL, Git
Domains: Large Language Models, Retrieval-Augmented Generation (RAG), Deep Learning, Vector DBs (ChromaDB)
PROJECTS:
1. Retrieval-Augmented Generation Medical Assistant (Python, PyTorch, LangChain, ChromaDB)
- Implemented RAG pipeline indexing PubMed abstracts with cosine similarity retrieval, minimizing hallucinations.
- Fine-tuned transformer models using LoRA on domain-specific corpora.
2. Predictive Customer Churn Analytics (Scikit-Learn, XGBoost, Pandas)
- Trained ensemble random forest and gradient boosted trees achieving 92.4% ROC-AUC on 200,000 tabular records.
EXPERIENCE:
Machine Learning Research Assistant - University AI Lab (Jan 2024 - Present)
- Conducted experiments evaluating attention architectures for tabular and sequential datasets.`;
    }

    const sampleBlob = new Blob([sampleContent], { type: 'application/pdf' });
    const sampleFileObj = new File([sampleBlob], fileName, { type: 'application/pdf' });
    setFile(sampleFileObj);
    showToast(`Loaded sample resume: "${fileName}". Ready to analyze!`, 'info');
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      showToast('Please select a PDF or DOCX file to analyze.', 'error');
      return;
    }

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      showToast('Only PDF and DOCX files are supported.', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds the 5MB limit.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetCareer', targetCareer);

    setLoading(true);
    try {
      const res = await uploadAndAnalyzeResume(formData);
      if (res.success) {
        setResumeAnalysis(res.data);
        showToast('Resume uploaded and audited successfully with Gemini AI!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to process resume.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Upload & Dropzone Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <FileText size={20} color="#f59e0b" /> AI Resume Analyzer & ATS Compatibility
            </h3>
            <p className="card-subtitle">
              Upload your resume in PDF or DOCX format for Gemini AI extraction, ATS keyword scoring, and career alignment.
            </p>
          </div>
          <span className="tag-chip tag-chip-primary">
            PDF & DOCX Supported (Max 5MB)
          </span>
        </div>

        <form onSubmit={handleUpload}>
          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Evaluate Alignment Against Target Career:</label>
            <input
              type="text"
              className="form-input"
              value={targetCareer}
              onChange={(e) => setTargetCareer(e.target.value)}
              placeholder="e.g. Full Stack Web Developer or AI Engineer"
            />
          </div>

          {/* Quick Sample Resume Pickers for Live Demonstration */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.84rem', fontWeight: 600, color: '#fbbf24' }}>
              <FileText size={16} /> Need a test resume for demo?
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                onClick={() => handleLoadSampleResume('fullstack')}
              >
                📄 Load Full Stack Developer Sample
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                onClick={() => handleLoadSampleResume('aiml')}
              >
                📄 Load AI & ML Engineer Sample
              </button>
            </div>
          </div>

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? '#6366f1' : 'var(--border-color)'}`,
              borderRadius: 'var(--radius-md)',
              padding: '36px 20px',
              textAlign: 'center',
              background: dragOver ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-input)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              marginBottom: '18px'
            }}
            onClick={() => document.getElementById('resumeFileInput').click()}
          >
            <input
              id="resumeFileInput"
              type="file"
              accept=".pdf,.docx"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Upload size={36} color={file ? '#10b981' : '#64748b'} style={{ margin: '0 auto 12px' }} />
            {file ? (
              <div>
                <span style={{ fontWeight: 600, color: '#34d399' }}>Selected File: {file.name}</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  ({(file.size / 1024).toFixed(1)} KB) - Click or drag another file to replace
                </p>
              </div>
            ) : (
              <div>
                <span style={{ fontWeight: 600 }}>Click to browse or drag and drop your resume file</span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Supported formats: PDF or Microsoft Word (DOCX)
                </p>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading || !file}>
            {loading ? <LoadingSpinner label="Extracting & Auditing Resume with AI..." /> : (
              <>
                <Sparkles size={16} /> Analyze Resume
              </>
            )}
          </button>
        </form>
      </div>

      {/* Analysis Results Display */}
      {resumeAnalysis && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Overview Score Card */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(99, 102, 241, 0.08))',
              borderColor: 'rgba(245, 158, 11, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="tag-chip tag-chip-warning">
                    File: {resumeAnalysis.fileName}
                  </span>
                  <span className="tag-chip tag-chip-success">
                    {resumeAnalysis.careerAlignment?.careerReadiness || 'Evaluated'}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                  Resume Audit & ATS Alignment Score
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', marginTop: '4px' }}>
                  {resumeAnalysis.summary}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#f59e0b' }}>
                    {resumeAnalysis.resumeScore}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Resume Quality / 100
                  </span>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#10b981' }}>
                    {resumeAnalysis.careerAlignment?.alignmentScore || 75}%
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Target Alignment
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Competencies & Extracted Data Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div className="card">
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#38bdf8', marginBottom: '12px' }}>
                Identified Technical Skills
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {resumeAnalysis.technicalSkills?.map((s, idx) => (
                  <span key={idx} className="tag-chip tag-chip-primary">{s}</span>
                ))}
              </div>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#34d399', margin: '16px 0 10px' }}>
                Identified Soft Skills
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {resumeAnalysis.softSkills?.map((s, idx) => (
                  <span key={idx} className="tag-chip tag-chip-success">{s}</span>
                ))}
              </div>
            </div>

            <div className="card">
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#34d399', marginBottom: '10px' }}>
                Verified Strengths
              </h4>
              <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {resumeAnalysis.strengths?.map((str, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{str}</li>
                ))}
              </ul>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f87171', margin: '16px 0 10px' }}>
                Missing or Underrepresented Skills
              </h4>
              <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {resumeAnalysis.missingSkills?.map((m, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{m}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Improvement Suggestions */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '14px' }}>
              <TrendingUp size={18} color="#f59e0b" /> Actionable Resume Improvements
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {resumeAnalysis.improvementSuggestions?.map((sug, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.86rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.45
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#f59e0b', marginRight: '6px' }}>#{idx + 1}</span>
                  {sug}
                </div>
              ))}
            </div>
          </div>

          {/* Target Career Alignment Matrix */}
          {resumeAnalysis.careerAlignment && (
            <div className="card" style={{ border: '1px solid rgba(99, 102, 241, 0.3)' }}>
              <div className="card-header">
                <div>
                  <h3 className="card-title">
                    <Briefcase size={18} color="#6366f1" /> Alignment with {resumeAnalysis.careerAlignment.targetCareer}
                  </h3>
                  <p className="card-subtitle">
                    Comparing your resume content directly against real-world job posting expectations for this title.
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)' }}>
                  <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#34d399', marginBottom: '8px' }}>
                    Matching Skills Present in Resume
                  </h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {resumeAnalysis.careerAlignment.matchingSkills?.map((ms, idx) => (
                      <span key={idx} className="tag-chip tag-chip-success">{ms}</span>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)' }}>
                  <h5 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#f87171', marginBottom: '8px' }}>
                    Missing Career-Specific Keywords
                  </h5>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {resumeAnalysis.careerAlignment.missingCareerSkills?.map((ms, idx) => (
                      <span key={idx} className="tag-chip tag-chip-warning">{ms}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                <button className="btn btn-primary" onClick={() => setActiveSection('alignment')}>
                  View Overall Career Alignment Matrix <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

