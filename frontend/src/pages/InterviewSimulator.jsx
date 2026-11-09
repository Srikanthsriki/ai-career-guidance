import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { startInterview, submitInterviewAnswer, getInterviewHistory } from '../services/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import {
  Mic,
  MicOff,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  RefreshCw,
  Clock,
  HelpCircle,
  Volume2
} from 'lucide-react';

export const InterviewSimulator = () => {
  const { recommendation, showToast } = useApp();

  const [career, setCareer] = useState(recommendation?.bestFitCareer || 'Full Stack Web Developer');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [category, setCategory] = useState('Technical & Behavioral');

  const [session, setSession] = useState(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [starting, setStarting] = useState(false);
  const [history, setHistory] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getInterviewHistory();
        if (res.success && Array.isArray(res.sessions)) {
          setHistory(res.sessions);
        }
      } catch (err) {
        console.warn('Could not fetch history:', err.message);
      }
    };
    fetchHistory();
  }, []);

  const handleStartSession = async (e) => {
    e.preventDefault();
    setStarting(true);
    try {
      const categories = category.includes('&') ? ['Technical', 'Behavioral'] : [category];
      const res = await startInterview(career, difficulty, categories);
      if (res.success) {
        setSession(res.session);
        setActiveQuestionIndex(0);
        setCurrentAnswer('');
        showToast('Interview session initialized! Answer questions one by one.', 'success');
      }
    } catch (err) {
      showToast('Failed to start interview session.', 'error');
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAnswer.trim()) {
      showToast('Please type your answer before submitting for evaluation.', 'error');
      return;
    }

    const currentQ = session.questions[activeQuestionIndex];
    setEvaluating(true);
    try {
      const res = await submitInterviewAnswer(session._id, currentQ.questionId, currentAnswer);
      if (res.success) {
        setSession(res.session);
        showToast('Answer evaluated by AI!', 'success');
        setCurrentAnswer('');
      }
    } catch (err) {
      showToast('Failed to submit answer for evaluation.', 'error');
    } finally {
      setEvaluating(false);
    }
  };

  const toggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice-to-Text is not supported by your current browser. You can type your answer directly.', 'error');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      showToast('Microphone recording stopped.', 'info');
    } else {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsRecording(true);
          showToast('Microphone active! Speak your answer clearly...', 'info');
        };

        recognition.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setCurrentAnswer((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        };

        recognition.onerror = (event) => {
          console.warn('Speech recognition error:', event.error);
          setIsRecording(false);
          showToast(`Microphone notice: ${event.error}`, 'error');
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error('Failed to initialize speech recognition:', err);
        setIsRecording(false);
        showToast('Could not start microphone recording.', 'error');
      }
    }
  };

  const activeQuestion = session?.questions?.[activeQuestionIndex];
  const isQuestionAnswered = Boolean(activeQuestion?.studentAnswer);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Session Setup or Active Question Deck */}
      {!session ? (
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">
                <Mic size={20} color="#06b6d4" /> 3.10 AI Technical & Behavioral Interview Simulator
              </h3>
              <p className="card-subtitle">
                Configure your mock interview session. Gemini AI will generate tailored questions and grade your answers against real hiring rubrics.
              </p>
            </div>
          </div>

          <form onSubmit={handleStartSession}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Interview Career Track</label>
                <input
                  type="text"
                  className="form-input"
                  value={career}
                  onChange={(e) => setCareer(e.target.value)}
                  placeholder="e.g. Full Stack Web Developer"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Difficulty Level</label>
                <select
                  className="form-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="Beginner">Beginner (Foundations & Syntax)</option>
                  <option value="Intermediate">Intermediate (Real-world scenarios & Architecture)</option>
                  <option value="Advanced">Advanced (System design, Edge cases & Optimization)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Question Categories</label>
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="Technical & Behavioral">Technical & Behavioral (Mixed)</option>
                  <option value="Technical">Technical Only</option>
                  <option value="Behavioral">Behavioral (STAR Method)</option>
                  <option value="Practical Problems">Practical Problems & Troubleshooting</option>
                  <option value="Scenario-based">Scenario-based Architecture</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '12px' }} disabled={starting}>
              {starting ? <LoadingSpinner label="Generating Interview Questions..." /> : (
                <>
                  <Mic size={16} /> Start Interview Session
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Session Status Bar */}
          <div className="card" style={{ padding: '16px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span className="tag-chip tag-chip-primary">Role: {session.career}</span>
                <span className="tag-chip tag-chip-warning" style={{ marginLeft: '8px' }}>Level: {session.difficulty}</span>
              </div>

              {session.status === 'completed' ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="tag-chip tag-chip-success">
                    Session Completed • Overall Score: {session.overallScore}% ({session.performanceRating})
                  </span>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => setSession(null)}>
                    <RefreshCw size={14} /> New Session
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Question {activeQuestionIndex + 1} of {session.questions.length}
                  </span>
                  <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => setSession(null)}>
                    Exit
                  </button>
                </div>
              )}
            </div>

            {/* Question Selector Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
              {session.questions.map((q, idx) => (
                <button
                  key={idx}
                  className={`btn ${activeQuestionIndex === idx ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  onClick={() => {
                    setActiveQuestionIndex(idx);
                    setCurrentAnswer('');
                  }}
                >
                  Q{idx + 1} {q.studentAnswer ? `(${q.score}%)` : '• Pending'}
                </button>
              ))}
            </div>
          </div>

          {/* Active Question Panel */}
          {activeQuestion && (
            <div className="card" style={{ border: '1px solid rgba(6, 182, 212, 0.35)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="tag-chip tag-chip-primary">{activeQuestion.category} Question</span>
                {activeQuestion.score > 0 && (
                  <span className="tag-chip tag-chip-success">Scored: {activeQuestion.score} / 100</span>
                )}
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '20px' }}>
                {activeQuestion.questionText}
              </h3>

              {!isQuestionAnswered ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Your Answer:</label>
                    <button
                      type="button"
                      className={`btn ${isRecording ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        padding: '6px 14px',
                        fontSize: '0.78rem',
                        background: isRecording ? '#ef4444' : undefined,
                        borderColor: isRecording ? '#dc2626' : undefined,
                        color: 'white'
                      }}
                      onClick={toggleRecording}
                    >
                      {isRecording ? (
                        <>
                          <MicOff size={14} /> Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic size={14} color="#06b6d4" /> Answer with Voice (Mic)
                        </>
                      )}
                    </button>
                  </div>

                  {isRecording && (
                    <div
                      style={{
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        marginBottom: '10px',
                        fontSize: '0.8rem',
                        color: '#fca5a5',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                      <span>Microphone is active. Speak clearly into your device...</span>
                    </div>
                  )}

                  <textarea
                    className="form-textarea"
                    style={{ minHeight: '140px', marginBottom: '14px' }}
                    placeholder="Provide a comprehensive technical or behavioral answer. You can type or use the voice button above..."
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                  />

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      className="btn btn-primary"
                      onClick={handleSubmitAnswer}
                      disabled={evaluating || !currentAnswer.trim()}
                    >
                      {evaluating ? <LoadingSpinner label="AI is evaluating answer..." /> : (
                        <>
                          <Send size={16} /> Submit Answer for AI Evaluation
                        </>
                      )}
                    </button>

                    {currentAnswer && (
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                        onClick={() => setCurrentAnswer('')}
                        disabled={evaluating}
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Evaluated Answer Display */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)' }}>
                    <h5 style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Your Submitted Answer:
                    </h5>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      {activeQuestion.studentAnswer}
                    </p>
                  </div>

                  {/* Rubric Breakdown Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Relevance</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8' }}>{activeQuestion.relevance}%</div>
                    </div>
                    <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Tech Accuracy</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#34d399' }}>{activeQuestion.technicalAccuracy}%</div>
                    </div>
                    <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Clarity</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#a78bfa' }}>{activeQuestion.clarity}%</div>
                    </div>
                    <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Problem Solving</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fbbf24' }}>{activeQuestion.problemSolving}%</div>
                    </div>
                    <div style={{ padding: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Communication</span>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f43f5e' }}>{activeQuestion.communication}%</div>
                    </div>
                  </div>

                  {/* Strengths & Improvements */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', marginBottom: '6px' }}>Identified Strengths:</h5>
                      <ul style={{ paddingLeft: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {activeQuestion.strengths?.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                      <h5 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f87171', marginBottom: '6px' }}>Areas for Refinement:</h5>
                      <ul style={{ paddingLeft: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                        {activeQuestion.areasForImprovement?.map((a, idx) => (
                          <li key={idx}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Model Answer Approach */}
                  {activeQuestion.suggestedAnswerApproach && (
                    <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)' }}>
                      <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#818cf8', marginBottom: '6px' }}>
                        Expert Suggested Answer Strategy:
                      </h5>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {activeQuestion.suggestedAnswerApproach}
                      </p>
                    </div>
                  )}

                  {/* Navigation to next question */}
                  {activeQuestionIndex < session.questions.length - 1 && (
                    <button
                      className="btn btn-primary"
                      style={{ alignSelf: 'flex-start', marginTop: '10px' }}
                      onClick={() => {
                        setActiveQuestionIndex(activeQuestionIndex + 1);
                        setCurrentAnswer('');
                      }}
                    >
                      Proceed to Question {activeQuestionIndex + 2} <ArrowRight size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Final Session Report when completed */}
          {session.status === 'completed' && session.finalReport && (
            <div className="card" style={{ border: '1px solid rgba(16, 185, 129, 0.4)' }}>
              <div className="card-header">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span className="tag-chip tag-chip-success">Official Evaluation Result</span>
                    <span className="tag-chip tag-chip-primary">{session.performanceRating} Rating</span>
                  </div>
                  <h3 className="card-title">Comprehensive Interview Performance Report</h3>
                </div>
              </div>

              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                {session.finalReport.summary}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)' }}>
                  <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399', marginBottom: '6px' }}>Key Strengths Demonstrated:</h5>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {session.finalReport.overallStrengths?.map((s, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{s}</li>
                    ))}
                  </ul>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-input)' }}>
                  <h5 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fbbf24', marginBottom: '6px' }}>Priority Action Items:</h5>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    {session.finalReport.keyActionItems?.map((a, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>{a}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Past Session History Card */}
      {history.length > 0 && (
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '14px' }}>
            <Clock size={18} color="#94a3b8" /> Past Interview History
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {history.slice(0, 4).map((h, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.82rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                  <span>{h.career}</span>
                  <span style={{ color: '#10b981' }}>{h.overallScore}%</span>
                </div>
                <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                  {h.difficulty} • {new Date(h.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

