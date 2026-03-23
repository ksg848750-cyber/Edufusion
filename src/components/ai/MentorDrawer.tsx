'use client';

import { useState, useRef, useEffect } from 'react';
import NbButton from '@/components/ui/NbButton';
import { useAuth } from '@/context/AuthContext';

interface MentorDrawerProps {
  courseId?: string;
  topicId?: string;
  subtopicId?: string;
  subtopicTitle?: string;
  activeInterest: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function MentorDrawer({
  courseId,
  topicId,
  subtopicId,
  subtopicTitle,
  activeInterest,
  isOpen,
  onClose,
}: MentorDrawerProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const token = await user?.getIdToken();
      if (!token) return;

      const res = await fetch('/api/mentor-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          courseId,
          topicId,
          subtopicId,
          subtopicTitle,
          activeInterest,
        }),
      });

      const data = await res.json();
      if (data.response) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: data.response },
        ]);
      }
    } catch (e) {
      console.error('Mentor chat error:', e);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I had trouble connecting. Try again!' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed top-0 right-0 h-full w-full sm:w-[500px] z-50 flex flex-col"
      style={{
        background: 'var(--theme-bg)',
        borderLeft: 'var(--theme-border)',
        boxShadow: '-10px 0 0 rgba(0,0,0,0.5)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-6"
        style={{ borderBottom: 'var(--theme-border)', background: 'var(--theme-accent)' }}
      >
        <div>
          <div className="nb-display" style={{ fontSize: '24px', color: 'var(--theme-bg)', lineHeight: 1 }}>
            AI MENTOR
          </div>
          <div className="nb-mono mt-1" style={{ fontSize: '10px', fontWeight: 'bold', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em' }}>
            LIVE GUIDANCE // ACTIVE
          </div>
        </div>
        <NbButton variant="dark" size="sm" onClick={onClose}>
          ✕
        </NbButton>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center mt-8">
            <div style={{ fontSize: '48px' }}>🤖</div>
            <p className="nb-mono mt-3" style={{ fontSize: '12px', color: '#666' }}>
              INITIALIZING TERMINAL... ASK ANYTHING.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.role === 'user' ? 'nb-chat-user ml-12' : 'nb-chat-ai mr-12'}
            style={{ 
              color: msg.role === 'user' ? 'var(--theme-bg)' : 'var(--theme-text)',
              padding: '1rem 1.25rem',
              border: 'var(--theme-border)',
              background: msg.role === 'user' ? 'var(--theme-accent)' : 'var(--theme-bg)'
            }}
          >
            <div className="nb-mono mb-1" style={{ fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase', opacity: 0.5 }}>
              {msg.role === 'user' ? 'YOU' : 'AI MENTOR'}
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </p>
          </div>
        ))}

        {loading && (
          <div 
            className="nb-chat-ai mr-12 bg-black border-2 border-dashed border-white/20"
            style={{ padding: '1rem' }}
          >
            <div className="nb-mono" style={{ fontSize: '12px', color: '#888' }}>
              GENERATING...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 pb-10" style={{ borderTop: 'var(--theme-border)', background: 'var(--theme-bg)' }}>
        <div className="flex gap-2">
          <input
            className="nb-input flex-1"
            placeholder="INPUT COMMAND..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
            disabled={loading}
          />
          <NbButton
            variant="default"
            style={{ background: 'var(--theme-accent)', color: 'var(--theme-bg)' }}
            onClick={sendMessage}
            disabled={!input.trim() || loading}
          >
            SEND
          </NbButton>
        </div>
      </div>
    </div>
  );
}
