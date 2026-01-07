import Markdown from 'react-markdown';

function LoadingDots() {
  return (
    <div className="flex items-center gap-1.5 py-4">
      <div
        className="w-2 h-2 rounded-full animate-bounce"
        style={{ background: 'var(--forest-600)', animationDelay: '0ms' }}
      />
      <div
        className="w-2 h-2 rounded-full animate-bounce"
        style={{ background: 'var(--forest-600)', animationDelay: '150ms' }}
      />
      <div
        className="w-2 h-2 rounded-full animate-bounce"
        style={{ background: 'var(--forest-600)', animationDelay: '300ms' }}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div
        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
        style={{
          background: 'var(--cream-200)',
        }}
      >
        <svg
          className="w-8 h-8"
          style={{ color: 'var(--text-muted)' }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          <rect x="9" y="3" width="6" height="4" rx="2" />
          <path d="M9 12h6" />
          <path d="M9 16h6" />
        </svg>
      </div>
      <p
        className="text-sm"
        style={{ color: 'var(--text-muted)' }}
      >
        粘贴聊天记录后点击「开始分析」
      </p>
    </div>
  );
}

function ErrorDisplay({ error }) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{
        background: 'rgba(217, 107, 79, 0.1)',
        border: '1px solid rgba(217, 107, 79, 0.3)',
      }}
    >
      <p className="text-sm" style={{ color: 'var(--coral-600)' }}>
        {error}
      </p>
    </div>
  );
}

export default function AnalysisDisplay({ analysis, isLoading, error }) {
  if (error) {
    return (
      <div
        className="animate-fade-in bg-white/70 backdrop-blur-sm rounded-2xl p-4 md:p-6"
        style={{
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-light)',
        }}
      >
        <ErrorDisplay error={error} />
      </div>
    );
  }

  if (!analysis && !isLoading) {
    return (
      <div
        className="animate-fade-in bg-white/70 backdrop-blur-sm rounded-2xl p-4 md:p-6"
        style={{
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-light)',
        }}
      >
        <EmptyState />
      </div>
    );
  }

  return (
    <div
      className="animate-fade-in bg-white/70 backdrop-blur-sm rounded-2xl p-4 md:p-6"
      style={{
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-light)',
      }}
    >
      <h2
        className="text-lg font-semibold mb-4"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--text-primary)',
        }}
      >
        分析报告
      </h2>

      {isLoading && !analysis && <LoadingDots />}

      {analysis && (
        <div className="analysis-markdown">
          <Markdown>{analysis}</Markdown>
        </div>
      )}

      {isLoading && analysis && (
        <div className="mt-2 flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="animate-pulse">●</span>
          正在生成...
        </div>
      )}
    </div>
  );
}
