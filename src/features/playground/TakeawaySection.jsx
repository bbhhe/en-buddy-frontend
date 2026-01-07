import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import TakeawayExportCard from './TakeawayExportCard';

function SaveIcon({ className }) {
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
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

function DownloadIcon({ className }) {
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
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function CheckIcon({ className }) {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function TakeawaySection({ takeaway, onSave, disabled }) {
  const [inputValue, setInputValue] = useState(takeaway || '');
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const exportCardRef = useRef(null);

  const handleSave = () => {
    if (inputValue.trim()) {
      onSave(inputValue.trim());
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleExport = async () => {
    if (!inputValue.trim() || !exportCardRef.current) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(exportCardRef.current, {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true,
      });

      const link = document.createElement('a');
      link.download = `en-buddy-takeaway-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('导出失败:', error);
    } finally {
      setExporting(false);
    }
  };

  // Update input when takeaway prop changes
  if (takeaway !== inputValue && takeaway && !inputValue) {
    setInputValue(takeaway);
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
        className="text-lg font-semibold mb-3"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--text-primary)',
        }}
      >
        今日金句
      </h2>

      <p
        className="text-xs mb-4"
        style={{ color: 'var(--text-muted)' }}
      >
        记录一句最有收获的表达或语法点
      </p>

      <div className="flex gap-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="例如：I am very happy (not: I very happy)"
          className="flex-1 px-4 py-2.5 rounded-xl text-sm transition-all"
          style={{
            background: 'var(--cream-50)',
            border: '2px solid var(--border-light)',
            color: 'var(--text-primary)',
          }}
          disabled={disabled}
        />

        <button
          onClick={handleSave}
          disabled={disabled || !inputValue.trim()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{
            background: saved
              ? 'var(--forest-600)'
              : disabled || !inputValue.trim()
              ? 'var(--cream-300)'
              : 'linear-gradient(135deg, var(--forest-600) 0%, var(--forest-700) 100%)',
            color: disabled || !inputValue.trim() ? 'var(--text-muted)' : 'white',
            boxShadow: disabled || !inputValue.trim()
              ? 'none'
              : '0 4px 12px rgba(45, 90, 74, 0.25)',
          }}
        >
          {saved ? (
            <>
              <CheckIcon className="w-4 h-4" />
              已保存
            </>
          ) : (
            <>
              <SaveIcon className="w-4 h-4" />
              保存
            </>
          )}
        </button>

        <button
          onClick={handleExport}
          disabled={exporting || !inputValue.trim()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{
            background: !inputValue.trim()
              ? 'var(--cream-300)'
              : 'linear-gradient(135deg, var(--coral-500) 0%, var(--coral-600) 100%)',
            color: !inputValue.trim() ? 'var(--text-muted)' : 'white',
            boxShadow: !inputValue.trim()
              ? 'none'
              : '0 4px 12px rgba(217, 107, 79, 0.25)',
          }}
        >
          <DownloadIcon className="w-4 h-4" />
          {exporting ? '导出中...' : '导出卡片'}
        </button>
      </div>

      {/* Hidden export card */}
      <div className="fixed -left-[9999px] -top-[9999px]">
        <TakeawayExportCard ref={exportCardRef} takeaway={inputValue} />
      </div>
    </div>
  );
}
