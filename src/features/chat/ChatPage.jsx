import { useRef, useEffect } from 'react';
import ChatInput from './ChatInput';
import MessageList from './MessageList';
import { useChat } from '../../hooks/useChat';

// Decorative book icon for the header
function BookIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M8 7h8" />
      <path d="M8 11h6" />
    </svg>
  );
}

// Decorative element - stylized quotation mark
function QuoteDecoration() {
  return (
    <div className="absolute -top-3 -left-3 opacity-10 pointer-events-none">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="currentColor" className="text-[var(--forest-600)]">
        <path d="M14 24c-3.3 0-6-2.7-6-6s2.7-6 6-6c1.1 0 2.1.3 3 .8C15.4 8.3 11.3 5 6 5v4c3.3 0 6 2.7 6 6v15h8V24h-6zm20 0c-3.3 0-6-2.7-6-6s2.7-6 6-6c1.1 0 2.1.3 3 .8C35.4 8.3 31.3 5 26 5v4c3.3 0 6 2.7 6 6v15h8V24h-6z" />
      </svg>
    </div>
  );
}

export default function ChatPage() {
  const { messages, sendMessage, isLoading } = useChat();
  const messagesEndRef = useRef(null);
  const mainRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div
      className="flex flex-col h-screen max-w-3xl mx-auto px-4 py-6 md:py-8"
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {/* Header */}
      <header className="animate-fade-in mb-6 md:mb-8">
        <div
          className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 md:p-8"
          style={{
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-light)',
          }}
        >
          <QuoteDecoration />

          {/* Logo & Title */}
          <div className="flex items-center gap-4">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, var(--forest-600) 0%, var(--forest-700) 100%)',
                boxShadow: '0 4px 12px rgba(45, 90, 74, 0.25)',
              }}
            >
              <BookIcon className="w-6 h-6 text-white" />
            </div>

            <div>
              <h1
                className="text-2xl md:text-3xl font-semibold tracking-tight"
                style={{
                  fontFamily: 'var(--font-display)',
                  color: 'var(--text-primary)',
                }}
              >
                En-Buddy
              </h1>
              <p
                className="text-sm mt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                Your personal English learning companion
              </p>
            </div>
          </div>

          {/* Decorative line */}
          <div
            className="absolute bottom-0 left-8 right-8 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, var(--border-light) 50%, transparent 100%)',
            }}
          />
        </div>
      </header>

      {/* Main Chat Area */}
      <main
        ref={mainRef}
        className="flex-1 overflow-y-auto rounded-2xl p-4 md:p-6 animate-fade-in stagger-2"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.3) 100%)',
          backdropFilter: 'blur(8px)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <MessageList messages={messages} isLoading={isLoading} />
        <div ref={messagesEndRef} className="h-4" />
      </main>

      {/* Input Area */}
      <footer className="mt-4 animate-fade-in stagger-3">
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </footer>
    </div>
  );
}
