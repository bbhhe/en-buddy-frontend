import { useState } from 'react';

function SparklesIcon({ className }) {
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
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" />
      <path d="M19 13l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
      <path d="M6 17l.5 1.5L8 19l-1.5.5L6 21l-.5-1.5L4 19l1.5-.5L6 17z" />
    </svg>
  );
}

function ClearIcon({ className }) {
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
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

export default function ChatHistoryInput({ value, onChange, onAnalyze, isAnalyzing, disabled }) {
  const [isFocused, setIsFocused] = useState(false);
  const maxLength = 50000;
  const charCount = value.length;

  const handleClear = () => {
    onChange('');
  };

  return (
    <div
      className="animate-fade-in bg-white/70 backdrop-blur-sm rounded-2xl p-4 md:p-6"
      style={{
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-light)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2
          className="text-lg font-semibold"
          style={{
            fontFamily: 'var(--font-display)',
            color: 'var(--text-primary)',
          }}
        >
          聊天记录
        </h2>
        <span
          className="text-xs"
          style={{
            color: charCount > maxLength * 0.9 ? 'var(--coral-600)' : 'var(--text-muted)',
          }}
        >
          {charCount.toLocaleString()} / {maxLength.toLocaleString()}
        </span>
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="粘贴你和 AI 的聊天记录...

例如：
User: Hi, how are you today?
AI: I'm doing great! How about you?
User: I very happy because I passed my exam.
AI: Congratulations! That's wonderful news!"
          className="w-full resize-none rounded-xl p-4 text-sm leading-relaxed transition-all"
          style={{
            minHeight: '180px',
            background: 'var(--cream-50)',
            border: isFocused ? '2px solid var(--forest-600)' : '2px solid var(--border-light)',
            boxShadow: isFocused
              ? '0 0 0 4px rgba(45, 90, 74, 0.1), var(--shadow-md)'
              : 'var(--shadow-sm)',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-body)',
          }}
          maxLength={maxLength}
          disabled={disabled}
        />

        {value && (
          <button
            onClick={handleClear}
            className="absolute top-3 right-3 p-1.5 rounded-lg transition-colors"
            style={{
              background: 'var(--cream-200)',
              color: 'var(--text-muted)',
            }}
            title="清空"
          >
            <ClearIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onAnalyze}
          disabled={disabled || !value.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{
            background: disabled || !value.trim()
              ? 'var(--cream-300)'
              : 'linear-gradient(135deg, var(--forest-600) 0%, var(--forest-700) 100%)',
            color: disabled || !value.trim() ? 'var(--text-muted)' : 'white',
            boxShadow: disabled || !value.trim()
              ? 'none'
              : '0 4px 12px rgba(45, 90, 74, 0.25)',
            cursor: disabled || !value.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {isAnalyzing ? (
            <>
              <span className="animate-spin">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              </span>
              分析中...
            </>
          ) : (
            <>
              <SparklesIcon className="w-4 h-4" />
              开始分析
            </>
          )}
        </button>
      </div>
    </div>
  );
}
