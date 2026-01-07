function PlusIcon({ className }) {
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
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TrashIcon({ className }) {
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
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    return `${diffDays} 天前`;
  } else {
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }
}

function HistoryItem({ record, isActive, onSelect, onDelete }) {
  return (
    <div
      onClick={() => onSelect(record.id)}
      className="group relative p-3 rounded-xl cursor-pointer transition-all"
      style={{
        background: isActive ? 'var(--sage-100)' : 'transparent',
        border: isActive ? '1px solid var(--sage-200)' : '1px solid transparent',
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {record.title}
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: 'var(--text-muted)' }}
          >
            {formatDate(record.createdAt)}
          </p>
          {record.takeaway && (
            <p
              className="text-xs mt-1 truncate"
              style={{ color: 'var(--forest-600)' }}
            >
              💡 {record.takeaway}
            </p>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(record.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all"
          style={{
            background: 'rgba(217, 107, 79, 0.1)',
            color: 'var(--coral-600)',
          }}
          title="删除"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default function HistorySidebar({
  records,
  currentRecordId,
  onSelectRecord,
  onDeleteRecord,
  onNewAnalysis,
  isOpen,
  onToggle,
}) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-50 md:z-auto
          h-full w-72
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:overflow-hidden'}
        `}
        style={{
          background: 'var(--cream-50)',
          borderRight: '1px solid var(--border-light)',
        }}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2
              className="text-base font-semibold"
              style={{
                fontFamily: 'var(--font-display)',
                color: 'var(--text-primary)',
              }}
            >
              历史记录
            </h2>
            <button
              onClick={onToggle}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* New Analysis Button */}
          <button
            onClick={onNewAnalysis}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all mb-4"
            style={{
              background: 'linear-gradient(135deg, var(--forest-600) 0%, var(--forest-700) 100%)',
              color: 'white',
              boxShadow: '0 4px 12px rgba(45, 90, 74, 0.25)',
            }}
          >
            <PlusIcon className="w-4 h-4" />
            新建分析
          </button>

          {/* Records List */}
          <div className="flex-1 overflow-y-auto -mx-2 px-2">
            {records.length === 0 ? (
              <div className="text-center py-8">
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-muted)' }}
                >
                  暂无历史记录
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {records.map((record) => (
                  <HistoryItem
                    key={record.id}
                    record={record}
                    isActive={record.id === currentRecordId}
                    onSelect={onSelectRecord}
                    onDelete={onDeleteRecord}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
