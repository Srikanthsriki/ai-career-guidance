import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { chatWithAgent, getMcpCatalog } from '../services/api';
import {
  Bot,
  Send,
  Sparkles,
  Terminal,
  User,
  Wrench,
  CheckCircle2,
  HelpCircle,
  Cpu
} from 'lucide-react';

export const AICareerAgent = () => {
  const { profile, recommendation } = useApp();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${profile?.name || 'there'}! I am your AI Career Assistant powered by Gemini and equipped with Model Context Protocol (MCP) tools.\n\nI have context of your recommended career (**${recommendation?.bestFitCareer || 'Full Stack Web Developer'}**). Ask me about roadmap milestones, learning resources, interview strategies, or technical concepts!`,
      toolExecution: null
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mcpTools, setMcpTools] = useState([]);
  const [showMcpDrawer, setShowMcpDrawer] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await getMcpCatalog();
        if (res.success) {
          setMcpTools(res.tools || []);
        }
      } catch (err) {
        console.warn('Failed to load MCP catalog:', err.message);
      }
    };
    fetchCatalog();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user', content: userMessage }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await chatWithAgent(userMessage, newHistory);
      if (res.success) {
        setMessages([
          ...newHistory,
          {
            role: 'assistant',
            content: res.reply,
            toolExecution: res.toolExecution
          }
        ]);
      }
    } catch (err) {
      setMessages([
        ...newHistory,
        {
          role: 'assistant',
          content: 'I encountered an error processing your query. Please verify backend connectivity.',
          toolExecution: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (promptText) => {
    setInput(promptText);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 140px)' }}>
      {/* Header Bar */}
      <div className="card" style={{ padding: '16px 20px', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="avatar-circle" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
              <Bot size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>AI Career Assistant & MCP Server</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Active Context: {profile?.name || 'Student'} • Target: {recommendation?.bestFitCareer || 'Full Stack'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              onClick={() => setShowMcpDrawer(!showMcpDrawer)}
            >
              <Cpu size={14} color="#6366f1" /> {showMcpDrawer ? 'Hide Tools' : 'View MCP Tools (5)'}
            </button>
            <span className="tag-chip tag-chip-success" style={{ fontSize: '0.72rem' }}>
              MCP v1.0 Active
            </span>
          </div>
        </div>

        {/* MCP Tools Catalog Drawer */}
        {showMcpDrawer && (
          <div
            style={{
              marginTop: '14px',
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              fontSize: '0.82rem'
            }}
          >
            <div style={{ fontWeight: 600, color: '#818cf8', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={14} /> Registered Model Context Protocol (MCP) Tool Schemas:
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '8px' }}>
              {mcpTools.map((t, idx) => (
                <div key={idx} style={{ padding: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: 600, color: '#38bdf8' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat Conversation History Area */}
      <div
        className="card"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '20px',
          gap: '16px'
        }}
      >
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '85%'
              }}
            >
              {!isUser && (
                <div className="avatar-circle" style={{ width: '32px', height: '32px', flexShrink: 0, background: '#6366f1' }}>
                  <Bot size={16} />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: isUser ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : 'var(--bg-input)',
                    color: 'white',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    border: isUser ? 'none' : '1px solid var(--border-color)',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {m.content}
                </div>

                {/* MCP Tool Execution Visual Pill */}
                {m.toolExecution && (
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      fontSize: '0.75rem',
                      color: '#6ee7b7',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Wrench size={13} />
                    <span>
                      MCP Tool Executed: <strong>{m.toolExecution.tool}</strong> (Status: {m.toolExecution.result?.status || 'success'})
                    </span>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="avatar-circle" style={{ width: '32px', height: '32px', flexShrink: 0, background: '#10b981' }}>
                  <User size={16} />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
            <div className="avatar-circle" style={{ width: '32px', height: '32px', background: '#6366f1' }}>
              <Bot size={16} />
            </div>
            <div style={{ padding: '12px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-input)' }}>
              <div className="loading-spinner" style={{ width: '16px', height: '16px' }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                Consulting MCP tools & Gemini AI...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button
          className="btn btn-secondary"
          style={{ padding: '5px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
          onClick={() => handleQuickPrompt("What are the best verified learning resources for my recommended career?")}
        >
          🔍 Search Learning Resources (MCP)
        </button>
        <button
          className="btn btn-secondary"
          style={{ padding: '5px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
          onClick={() => handleQuickPrompt("Check my current roadmap progress and tell me what milestones to complete next.")}
        >
          📈 Check Roadmap Progress (MCP)
        </button>
        <button
          className="btn btn-secondary"
          style={{ padding: '5px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
          onClick={() => handleQuickPrompt("What are the industry standards for Docker and CI/CD in production?")}
        >
          📚 Search Knowledge Standards (MCP)
        </button>
        <button
          className="btn btn-secondary"
          style={{ padding: '5px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
          onClick={() => handleQuickPrompt("How should I prepare for technical interviews for my career track?")}
        >
          🎤 Technical Interview Advice
        </button>
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Ask your AI Career Assistant with MCP tool capabilities..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

