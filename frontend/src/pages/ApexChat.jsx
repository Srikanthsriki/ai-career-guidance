import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { chatWithAgent } from '../services/api';
import {
  Bot,
  Send,
  Sparkles,
  User,
  CheckCircle2,
  Trash2,
  HelpCircle,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  Copy,
  Check
} from 'lucide-react';

export const ApexChat = () => {
  const { profile, recommendation, showToast, currentUser } = useApp();
  const studentName = currentUser?.name || profile?.name || 'Student';
  const targetCareer = recommendation?.bestFitCareer || profile?.preferredCareer || 'Software Engineering & AI';

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello **${studentName}**! 👋 I am **APEX**, your personal AI Career Advisor.\n\nI am here to guide you toward landing top roles in **${targetCareer}**.\n\nYou can ask me anything about:\n- 🚀 **Career Paths & Job Roles** in modern tech\n- 🗺️ **Step-by-Step Learning Roadmaps**\n- 💼 **Resume Improvement & ATS Optimization**\n- 🎤 **Technical & Behavioral Interview Prep**\n- 💰 **Salary Trends & Industry Expectations**\n\nWhat would you like to explore today?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const messagesEndRef = useRef(null);

  const samplePrompts = [
    `What skills do I need for ${targetCareer}?`,
    `How should I structure my tech resume to stand out?`,
    `Give me 3 practical portfolio project ideas with code architectures.`,
    `What are the most common technical interview questions for ${targetCareer}?`,
    `What are the salary expectations and market demand in 2026?`,
    `How do I transition from beginner to job-ready engineer?`
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage = textToSend.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user', content: userMessage }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await chatWithAgent(userMessage, newHistory);
      if (res.success && res.reply) {
        setMessages([
          ...newHistory,
          {
            role: 'assistant',
            content: res.reply
          }
        ]);
      } else {
        setMessages([
          ...newHistory,
          {
            role: 'assistant',
            content: `I am here to help! Could you please specify which career track or skill you would like to discuss?`
          }
        ]);
      }
    } catch (err) {
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: 'I had trouble connecting to the advisory engine. Please check that the server is active and try again.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: `Conversation refreshed! How can **APEX** assist your career path today, **${studentName}**?`
      }
    ]);
    showToast('Chat history reset.', 'info');
  };

  // Simple Markdown paragraph formatter
  const renderFormatted = (content) => {
    const lines = (content || '').split('\n');
    return lines.map((line, lIdx) => {
      if (!line.trim()) return <div key={lIdx} style={{ height: '8px' }} />;

      // Format bold text **bold**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={lIdx} style={{ marginLeft: '16px', listStyleType: 'disc' }}>
            {renderedParts}
          </li>
        );
      }

      if (/^\d+\.\s/.test(line.trim())) {
        return (
          <div key={lIdx} style={{ marginLeft: '4px', marginBottom: '4px' }}>
            {renderedParts}
          </div>
        );
      }

      return (
        <p key={lIdx} style={{ margin: '0 0 6px 0' }}>
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <div className="apex-container">
      {/* APEX Brand Header */}
      <div className="apex-header-card">
        <div className="apex-brand-badge">
          <div className="apex-avatar-glow">
            <Sparkles size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                APEX AI Career Assistant
              </h2>
              <span className="apex-status-pill">
                <span className="apex-pulse-dot" /> APEX Online
              </span>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Ask anything about tech roles, learning roadmaps, resumes, interview practice, and career strategies.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-secondary"
            style={{ padding: '7px 14px', fontSize: '0.8rem' }}
            title="Reset conversation"
          >
            <Trash2 size={14} /> Clear Chat
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="apex-chat-card">
        {/* Messages Scroll Area */}
        <div className="apex-messages-area">
          {messages.map((msg, idx) => (
            <div key={idx} className={`apex-bubble ${msg.role}`}>
              <div className="apex-bubble-avatar">
                {msg.role === 'user' ? studentName.charAt(0).toUpperCase() : <Bot size={18} />}
              </div>
              <div className="apex-bubble-content">
                {renderFormatted(msg.content)}
                {msg.role === 'assistant' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <button
                      onClick={() => handleCopy(msg.content, idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.72rem'
                      }}
                      title="Copy response"
                    >
                      {copiedIdx === idx ? <Check size={12} color="#34d399" /> : <Copy size={12} />}
                      <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="apex-bubble assistant">
              <div className="apex-bubble-avatar">
                <Bot size={18} />
              </div>
              <div className="apex-bubble-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="loading-spinner" style={{ width: '16px', height: '16px' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  APEX is analyzing career guidance intelligence...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="apex-suggestions-bar">
          {samplePrompts.map((promptText, pIdx) => (
            <button
              key={pIdx}
              type="button"
              className="apex-chip"
              onClick={() => handleSend(promptText)}
              disabled={loading}
            >
              <Sparkles size={12} color="#818cf8" />
              <span>{promptText}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="apex-input-area"
        >
          <input
            type="text"
            placeholder={`Ask APEX any career question (e.g. "What skills are needed for Full Stack Developer?")`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoFocus
          />
          <button type="submit" className="apex-send-btn" disabled={loading || !input.trim()}>
            <span>Ask APEX</span>
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ApexChat;

