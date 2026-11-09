import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { chatWithAgent } from '../services/api';
import {
  Sparkles,
  X,
  Send,
  Bot,
  Maximize2,
  Trash2,
  MessageSquare
} from 'lucide-react';

export const ApexWidget = () => {
  const { setActiveSection, profile, recommendation, currentUser } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const studentName = currentUser?.name || profile?.name || 'Student';
  const targetCareer = recommendation?.bestFitCareer || 'Software & AI Careers';

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi **${studentName}**! I'm **APEX**. Ask me anything about career guidance, learning roadmaps, skills, resumes, or interview questions!`
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user', content: userMessage }];
    setMessages(newHistory);
    setLoading(true);

    try {
      const res = await chatWithAgent(userMessage, newHistory);
      if (res.success && res.reply) {
        setMessages([
          ...newHistory,
          { role: 'assistant', content: res.reply }
        ]);
      }
    } catch (err) {
      setMessages([
        ...newHistory,
        { role: 'assistant', content: 'Connection error with APEX. Please ensure the backend is running.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const openFullChat = () => {
    setIsOpen(false);
    setActiveSection('apex');
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          className="apex-floating-button"
          onClick={() => setIsOpen(true)}
          title="Chat with APEX AI Career Advisor"
        >
          <Sparkles size={18} color="#ffffff" />
          <span>Ask APEX AI</span>
        </button>
      )}

      {/* Floating Popover Chat Modal */}
      {isOpen && (
        <div className="apex-floating-popover">
          {/* Header */}
          <div className="apex-popover-header">
            <div className="apex-popover-header-title">
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}
              >
                <Bot size={16} />
              </div>
              <div>
                <div style={{ lineHeight: 1.2 }}>APEX AI Assistant</div>
                <div style={{ fontSize: '0.68rem', color: '#34d399', fontWeight: 600 }}>● Online Advisor</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={openFullChat}
                className="apex-popover-close"
                title="Expand to full screen"
              >
                <Maximize2 size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="apex-popover-close"
                title="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="apex-messages-area" style={{ padding: '16px', gap: '12px' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`apex-bubble ${msg.role}`} style={{ maxWidth: '90%' }}>
                <div
                  className="apex-bubble-content"
                  style={{
                    padding: '10px 14px',
                    fontSize: '0.84rem',
                    lineHeight: 1.5
                  }}
                >
                  {(msg.content || '').split('\n').map((line, lIdx) => (
                    <div key={lIdx} style={{ marginBottom: line.trim() ? '4px' : '6px' }}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="apex-bubble assistant" style={{ maxWidth: '90%' }}>
                <div className="apex-bubble-content" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem' }}>
                  <span className="loading-spinner" style={{ width: '12px', height: '12px' }} />
                  <span>APEX is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="apex-input-area" style={{ padding: '12px 14px', gap: '8px' }}>
            <input
              type="text"
              placeholder="Ask about careers, skills, roadmaps..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={{ padding: '10px 14px', fontSize: '0.85rem' }}
              autoFocus
            />
            <button
              type="submit"
              className="apex-send-btn"
              disabled={loading || !input.trim()}
              style={{ padding: '10px 14px' }}
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ApexWidget;

