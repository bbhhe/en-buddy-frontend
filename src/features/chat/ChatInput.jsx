import { useState, useRef, useEffect } from 'react';

// Send button icon
function SendIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

export default function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = input.trim() && !disabled;

  return (
    <form onSubmit={handleSubmit}>
      <div
        className="relative rounded-2xl transition-all duration-200"
        style={{
          background: 'white',
          border: isFocused
            ? '2px solid var(--forest-600)'
            : '1px solid var(--border-light)',
          boxShadow: isFocused
            ? '0 0 0 4px rgba(45, 90, 74, 0.1), var(--shadow-lg)'
            : 'var(--shadow-md)',
          padding: isFocused ? '0' : '1px',
        }}
      >
        <div className="flex items-end gap-3 p-3">
          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Type your message in English..."
              disabled={disabled}
              rows={1}
              className="w-full resize-none border-0 bg-transparent px-2 py-2 text-[15px] leading-relaxed placeholder:text-gray-400 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--text-primary)',
                maxHeight: '150px',
              }}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={!canSend}
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: canSend
                ? 'linear-gradient(135deg, var(--forest-600) 0%, var(--forest-700) 100%)'
                : 'var(--cream-200)',
              boxShadow: canSend
                ? '0 4px 12px rgba(45, 90, 74, 0.25)'
                : 'none',
              transform: canSend ? 'scale(1)' : 'scale(0.95)',
            }}
            onMouseEnter={(e) => {
              if (canSend) {
                e.currentTarget.style.transform = 'scale(1.05)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = canSend ? 'scale(1)' : 'scale(0.95)';
            }}
          >
            <SendIcon
              className="w-5 h-5 transition-colors"
              style={{
                color: canSend ? 'white' : 'var(--text-muted)',
              }}
            />
          </button>
        </div>

        {/* Helper text */}
        <div
          className="px-5 pb-3 flex items-center justify-between"
          style={{ color: 'var(--text-muted)' }}
        >
          <span className="text-xs">
            Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px] font-medium">Enter</kbd> to send
          </span>
          <span className="text-xs">
            {input.length > 0 && `${input.length} characters`}
          </span>
        </div>
      </div>
    </form>
  );
}
