// Avatar component for AI assistant
function BuddyAvatar() {
  return (
    <div
      className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, var(--forest-600) 0%, var(--forest-700) 100%)',
        boxShadow: '0 2px 8px rgba(45, 90, 74, 0.2)',
      }}
    >
      <svg
        className="w-5 h-5 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="5" />
        <path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2" />
      </svg>
    </div>
  );
}

// User avatar
function UserAvatar() {
  return (
    <div
      className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, var(--coral-400) 0%, var(--coral-500) 100%)',
        boxShadow: '0 2px 8px rgba(217, 107, 79, 0.2)',
      }}
    >
      <svg
        className="w-5 h-5 text-white"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
}

// Typing indicator with animated dots
function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-fade-in">
      <BuddyAvatar />
      <div
        className="px-5 py-4 rounded-2xl rounded-bl-md"
        style={{
          background: 'white',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: 'var(--forest-600)',
                animation: 'bounce-dot 1.4s infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Empty state with illustration
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 animate-fade-in">
      {/* Decorative illustration */}
      <div
        className="relative w-32 h-32 mb-8 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, var(--sage-100) 0%, var(--sage-200) 100%)',
        }}
      >
        <svg
          className="w-16 h-16"
          style={{ color: 'var(--forest-600)' }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 9h8" />
          <path d="M8 13h6" />
        </svg>

        {/* Decorative elements */}
        <div
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full"
          style={{
            background: 'var(--coral-400)',
            opacity: 0.6,
          }}
        />
        <div
          className="absolute -bottom-1 -left-3 w-4 h-4 rounded-full"
          style={{
            background: 'var(--forest-600)',
            opacity: 0.4,
          }}
        />
      </div>

      <h3
        className="text-xl font-semibold mb-2"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--text-primary)',
        }}
      >
        Start Your English Journey
      </h3>

      <p
        className="text-center max-w-xs leading-relaxed"
        style={{ color: 'var(--text-muted)' }}
      >
        Say hello and begin practicing English with your personal learning companion!
      </p>

      {/* Suggestion chips */}
      <div className="flex flex-wrap justify-center gap-2 mt-6">
        {['Hello!', 'How are you?', "Let's practice!"].map((text, i) => (
          <span
            key={text}
            className="px-4 py-2 rounded-full text-sm cursor-default"
            style={{
              background: 'white',
              border: '1px solid var(--border-light)',
              color: 'var(--text-secondary)',
              animationDelay: `${i * 100}ms`,
            }}
          >
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

// Single message bubble
function MessageBubble({ message, isLast }) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : ''} ${isLast ? 'animate-fade-in' : ''}`}
    >
      {/* Avatar */}
      {isUser ? <UserAvatar /> : <BuddyAvatar />}

      {/* Message content */}
      <div
        className={`relative max-w-[75%] px-5 py-3.5 ${
          isUser
            ? 'rounded-2xl rounded-br-md'
            : 'rounded-2xl rounded-bl-md'
        }`}
        style={
          isUser
            ? {
                background: 'linear-gradient(135deg, var(--forest-600) 0%, var(--forest-700) 100%)',
                color: 'white',
                boxShadow: '0 2px 12px rgba(45, 90, 74, 0.15)',
              }
            : {
                background: 'white',
                border: '1px solid var(--border-light)',
                color: 'var(--text-primary)',
                boxShadow: 'var(--shadow-sm)',
              }
        }
      >
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </p>

        {/* Timestamp (optional visual element) */}
        <div
          className={`text-[10px] mt-1.5 ${isUser ? 'text-right' : 'text-left'}`}
          style={{
            opacity: 0.6,
            color: isUser ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
          }}
        >
          {new Date(message.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export default function MessageList({ messages, isLoading }) {
  if (messages.length === 0 && !isLoading) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-5">
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isLast={index === messages.length - 1}
        />
      ))}

      {isLoading && <TypingIndicator />}
    </div>
  );
}
