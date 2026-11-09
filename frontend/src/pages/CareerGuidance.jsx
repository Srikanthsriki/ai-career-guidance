import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { validateAndSaveProfile, generateRecommendation, compareCareers } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  GitCompare,
  TrendingUp,
  Layers,
  Award,
  BookOpen,
  RotateCcw
} from 'lucide-react';

export const CareerGuidance = () => {
  const { profile, setProfile, recommendation, setRecommendation, showToast, setActiveSection, currentUser } = useApp();

  const [formData, setFormData] = useState({
    name: profile?.name || currentUser?.name || '',
    education: profile?.education || '',
    skills: profile?.skills ? profile.skills.join(', ') : '',
    interests: profile?.interests ? profile.interests.join(', ') : '',
    programmingKnowledge: profile?.programmingKnowledge || '',
    experience: profile?.experience || 'Beginner',
    preferredCareer: profile?.preferredCareer || ''
  });

  // Sync state if profile or active student changes
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || currentUser?.name || '',
        education: profile.education || '',
        skills: profile.skills ? profile.skills.join(', ') : '',
        interests: profile.interests ? profile.interests.join(', ') : '',
        programmingKnowledge: profile.programmingKnowledge || '',
        experience: profile.experience || 'Beginner',
        preferredCareer: profile.preferredCareer || ''
      });
    } else {
      setFormData({
        name: currentUser?.name || '',
        education: '',
        skills: '',
        interests: '',
        programmingKnowledge: '',
        experience: 'Beginner',
        preferredCareer: ''
      });
    }
  }, [profile, currentUser]);

  const [validationErrors, setValidationErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors([]);

    try {
      const res = await validateAndSaveProfile(formData);
      if (res.success) {
        setProfile(res.profile);
        showToast('Profile validated & saved to MongoDB successfully!', 'success');

        // Automatically trigger AI recommendation
        const recRes = await generateRecommendation();
        if (recRes.success) {
          setRecommendation(recRes.data);
          showToast('AI Career Recommendation generated successfully!', 'success');
        }
      }
    } catch (err) {
      if (err.response?.data?.semanticValidationError) {
        setValidationErrors(err.response.data.feedback || [err.response.data.message]);
        showToast('Semantic validation check required more details.', 'error');
      } else {
        showToast(err.response?.data?.error || 'Failed to submit profile.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompareTrigger = async () => {
    setComparing(true);
    try {
      const careersToCompare = [
        recommendation?.bestFitCareer || "Full Stack Web Developer",
        ...(recommendation?.alternativeCareers?.map(a => a.title) || ["AI & Machine Learning Engineer", "Cloud & DevOps Engineer"])
      ].slice(0, 3);

      const res = await compareCareers(careersToCompare);
      if (res.success) {
        setComparisonResults(res.comparisons);
        showToast('Career comparative matrix compiled!', 'success');
      }
    } catch (err) {
      showToast('Failed to compare careers.', 'error');
    } finally {
      setComparing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Profile Form Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">
              <Compass size={20} color="#6366f1" /> Student Profile & AI Evaluation
            </h3>
            <p className="card-subtitle">
              Enter your verified academic profile. Our AI semantic auditor evaluates completeness and relevance before generating guidance.
            </p>
          </div>
          {profile?.isAiValidated && (
            <span className="tag-chip tag-chip-success">
              <CheckCircle2 size={14} /> Profile AI-Verified
            </span>
          )}
        </div>

        {/* Validation Errors Callout */}
        {validationErrors.length > 0 && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171', fontWeight: 600, marginBottom: '6px' }}>
              <AlertTriangle size={18} /> Clarification Required by AI Validator:
            </div>
            <ul style={{ paddingLeft: '22px', fontSize: '0.85rem', color: '#fca5a5' }}>
              {validationErrors.map((err, idx) => (
                <li key={idx} style={{ marginBottom: '4px' }}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick Demo Option for Users Who Want Sample Data */}
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: 600, color: '#a5b4fc' }}>
              <Sparkles size={16} /> Optional: Click Demo to Populate Sample Profile
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '3px 0 0 0' }}>
              Leave blank to type your own details, or click a demo preset below to test instantly:
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '6px 13px', fontSize: '0.78rem' }}
              onClick={() => {
                setFormData({
                  name: currentUser?.name || 'Alex Johnson',
                  education: 'B.Tech in Computer Science & Engineering (Final Year)',
                  skills: 'JavaScript, React.js, Node.js, Express, MongoDB, Git, HTML5, CSS3, REST APIs',
                  interests: 'Full Stack Web Development, Cloud Services, Scalable System Architecture',
                  programmingKnowledge: 'Strong proficiency in JavaScript/TypeScript, intermediate Python, solid Data Structures and Algorithms foundation',
                  experience: 'Intermediate',
                  preferredCareer: 'Full Stack Web Developer'
                });
                showToast('Full Stack Developer demo data loaded!', 'info');
              }}
            >
              🚀 Full Stack Demo
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '6px 13px', fontSize: '0.78rem' }}
              onClick={() => {
                setFormData({
                  name: currentUser?.name || 'Priya Sharma',
                  education: 'B.Tech in Artificial Intelligence & Data Science (3rd Year)',
                  skills: 'Python, PyTorch, Scikit-Learn, Pandas, NumPy, SQL, Git, Matplotlib',
                  interests: 'Machine Learning, Large Language Models, Deep Neural Networks, RAG Pipelines',
                  programmingKnowledge: 'Proficient in Python, familiar with C++ algorithms, trained deep learning models in PyTorch with strong math intuition',
                  experience: 'Intermediate',
                  preferredCareer: 'AI & Machine Learning Engineer'
                });
                showToast('AI & Machine Learning demo data loaded!', 'info');
              }}
            >
              🤖 AI & ML Demo
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '6px 13px', fontSize: '0.78rem' }}
              onClick={() => {
                setFormData({
                  name: currentUser?.name || 'David Miller',
                  education: 'B.S. in Information Technology & Systems (Final Year)',
                  skills: 'Linux, Docker, Kubernetes, AWS, Terraform, Bash Scripting, CI/CD, Git',
                  interests: 'Cloud Computing, DevOps Automation, High Availability SRE Architecture',
                  programmingKnowledge: 'Comfortable with Bash shell scripting, intermediate Python for automation, understanding of networking protocols',
                  experience: 'Intermediate',
                  preferredCareer: 'Cloud & DevOps Engineer'
                });
                showToast('Cloud & DevOps demo data loaded!', 'info');
              }}
            >
              ☁️ Cloud Demo
            </button>
            <button
              type="button"
              className="btn"
              style={{
                padding: '6px 13px',
                fontSize: '0.78rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171'
              }}
              onClick={() => {
                setFormData({
                  name: currentUser?.name || '',
                  education: '',
                  skills: '',
                  interests: '',
                  programmingKnowledge: '',
                  experience: 'Beginner',
                  preferredCareer: ''
                });
                showToast('Form cleared. Enter your own details.', 'info');
              }}
            >
              <RotateCcw size={13} style={{ marginRight: '4px' }} />
              Clear Form
            </button>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Alex Johnson"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Educational Background *</label>
              <input
                type="text"
                name="education"
                className="form-input"
                placeholder="e.g. B.Tech in Computer Science (3rd Year)"
                value={formData.education}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Technical Skills (comma-separated) *</label>
              <input
                type="text"
                name="skills"
                className="form-input"
                placeholder="e.g. JavaScript, React, HTML, CSS, Git, Node.js"
                value={formData.skills}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Interests & Problem Domains</label>
              <input
                type="text"
                name="interests"
                className="form-input"
                placeholder="e.g. Web Development, Cloud Computing, System Design"
                value={formData.interests}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Programming Knowledge Details *</label>
              <input
                type="text"
                name="programmingKnowledge"
                className="form-input"
                placeholder="e.g. Proficient in JavaScript, basic Python, OOP and Data Structures"
                value={formData.programmingKnowledge}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Experience Level</label>
              <select
                name="experience"
                className="form-select"
                value={formData.experience}
                onChange={handleChange}
              >
                <option value="Beginner">Beginner (0-1 years / Academic projects)</option>
                <option value="Intermediate">Intermediate (1-2 years / Internships & capstones)</option>
                <option value="Advanced">Advanced (Extensive portfolio & production experience)</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '8px' }}>
            <label className="form-label">Preferred Career (Optional / Aspiration)</label>
            <input
              type="text"
              name="preferredCareer"
              className="form-input"
              placeholder="e.g. Full Stack Web Developer or AI Engineer"
              value={formData.preferredCareer}
              onChange={handleChange}
            />
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <LoadingSpinner label="Validating with AI..." /> : (
                <>
                  <Sparkles size={16} /> Validate & Generate Career Recommendations
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* 3.2 AI Career Recommendation Display */}
      {recommendation && (
        <div className="card" style={{ border: '1px solid rgba(99, 102, 241, 0.35)' }}>
          <div className="card-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="tag-chip tag-chip-primary">
                  <Sparkles size={14} /> Gemini Generative AI Assessment
                </span>
                <span className="tag-chip tag-chip-success">
                  Match Score: {recommendation.matchScore}%
                </span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Best-Fit Career: {recommendation.bestFitCareer}
              </h2>
            </div>

            <button className="btn btn-secondary" onClick={handleCompareTrigger} disabled={comparing}>
              <GitCompare size={16} /> {comparing ? 'Comparing...' : 'Compare Career Tracks'}
            </button>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.03)',
              marginBottom: '20px',
              borderLeft: '4px solid var(--accent-primary)'
            }}
          >
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px', color: '#a5b4fc' }}>
              Why this career was recommended:
            </h4>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>
              {recommendation.recommendationExplanation}
            </p>
          </div>

          {/* Competencies Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '24px' }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginBottom: '10px' }}>
                Required Technical Skills
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {recommendation.requiredTechnicalSkills?.map((s, idx) => (
                  <span key={idx} className="tag-chip tag-chip-primary">{s}</span>
                ))}
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34d399', marginBottom: '10px' }}>
                Required Soft Skills
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {recommendation.requiredSoftSkills?.map((s, idx) => (
                  <span key={idx} className="tag-chip tag-chip-success">{s}</span>
                ))}
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', marginBottom: '10px' }}>
                Relevant Job Roles
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {recommendation.relevantJobRoles?.map((r, idx) => (
                  <span key={idx} className="tag-chip tag-chip-warning">{r}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Personalized Advice */}
          {recommendation.personalizedAdvice && (
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                marginBottom: '20px'
              }}
            >
              <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#34d399', marginBottom: '6px' }}>
                Personalized Career Guidance & Strategy:
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {recommendation.personalizedAdvice}
              </p>
            </div>
          )}

          {/* Alternative Careers */}
          {recommendation.alternativeCareers?.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px' }}>
                Alternative Career Options:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                {recommendation.alternativeCareers.map((alt, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.92rem' }}>{alt.title}</span>
                      <span className="tag-chip tag-chip-primary">{alt.matchScore}% Match</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                      {alt.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={() => setActiveSection('roadmap')}>
              Explore Skills & Learning Roadmap <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* 3.3 Career Comparison View */}
      {comparisonResults && (
        <div className="card" style={{ border: '1px solid rgba(16, 185, 129, 0.35)' }}>
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <GitCompare size={20} color="#10b981" /> Side-by-Side Career Comparison
              </h3>
              <p className="card-subtitle">
                Comprehensive comparative matrix across technical requirements, preparation time, and opportunities.
              </p>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px' }}>Attribute</th>
                  {comparisonResults.map((c, idx) => (
                    <th key={idx} style={{ padding: '12px 14px', color: '#818cf8', fontWeight: 700 }}>
                      {c.career}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Profile Match Score</td>
                  {comparisonResults.map((c, idx) => (
                    <td key={idx} style={{ padding: '12px 14px' }}>
                      <span className="tag-chip tag-chip-success">{c.matchScore}%</span>
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Learning Difficulty</td>
                  {comparisonResults.map((c, idx) => (
                    <td key={idx} style={{ padding: '12px 14px' }}>
                      <span className="tag-chip tag-chip-warning">{c.learningDifficulty}</span>
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Estimated Prep Timeline</td>
                  {comparisonResults.map((c, idx) => (
                    <td key={idx} style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      {c.prepTimeMonths}
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Key Technical Skills</td>
                  {comparisonResults.map((c, idx) => (
                    <td key={idx} style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {c.requiredSkills.map((s, sIdx) => (
                          <span key={sIdx} className="tag-chip" style={{ fontSize: '0.72rem' }}>{s}</span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Educational Requirements</td>
                  {comparisonResults.map((c, idx) => (
                    <td key={idx} style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      {c.educationalRequirement}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Market Opportunities</td>
                  {comparisonResults.map((c, idx) => (
                    <td key={idx} style={{ padding: '12px 14px', color: 'var(--text-secondary)' }}>
                      {c.careerOpportunities}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

