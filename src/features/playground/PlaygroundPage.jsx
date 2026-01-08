import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCoach, usePlaygroundHistory } from '../../hooks';
import ChatHistoryInput from './ChatHistoryInput';
import AnalysisDisplay from './AnalysisDisplay';
import TakeawaySection from './TakeawaySection';
import HistorySidebar from './HistorySidebar';

// Icons
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

function ArrowLeftIcon({ className }) {
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
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

export default function PlaygroundPage() {
  const { analysis, isAnalyzing, error, analyzeChat, clearAnalysis, setAnalysisContent } = useCoach();
  const {
    records,
    currentRecord,
    saveRecord,
    selectRecord,
    deleteRecord,
    updateTakeaway,
    clearCurrentRecord,
  } = usePlaygroundHistory();

  const location = useLocation();
  const [chatHistory, setChatHistory] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const exportCardRef = useRef(null);

  // Handle incoming analysis request
  useEffect(() => {
    if (location.state?.initialHistory) {
      const history = location.state.initialHistory;
      setChatHistory(history);

      if (location.state.autoAnalyze) {
        // Clear history state to prevent re-analysis on refresh
        window.history.replaceState({}, document.title);

        // Execute analysis
        analyzeChat(history).then(result => {
          if (result) {
            saveRecord({ chatHistory: history, analysis: result });
          }
        });
      }
    }
  }, [location.state, analyzeChat, saveRecord]);

  // Handle analysis
  const handleAnalyze = async () => {
    const result = await analyzeChat(chatHistory);
    if (result) {
      saveRecord({ chatHistory, analysis: result });
    }
  };

  // Handle selecting a record from history
  const handleSelectRecord = (id) => {
    selectRecord(id);
    const record = records.find((r) => r.id === id);
    if (record) {
      setChatHistory(record.chatHistory);
      setAnalysisContent(record.analysis);
    }
  };

  // Handle new analysis
  const handleNewAnalysis = () => {
    clearCurrentRecord();
    setChatHistory('');
    clearAnalysis();
  };

  // Handle takeaway save
  const handleSaveTakeaway = (takeaway) => {
    if (currentRecord) {
      updateTakeaway(currentRecord.id, takeaway);
    }
  };

  // Get current takeaway
  const currentTakeaway = currentRecord?.takeaway || '';

  return (
    <div className="flex h-screen" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Sidebar */}
      <HistorySidebar
        records={records}
        currentRecordId={currentRecord?.id}
        onSelectRecord={handleSelectRecord}
        onDeleteRecord={deleteRecord}
        onNewAnalysis={handleNewAnalysis}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="animate-fade-in p-4 md:p-6">
          <div
            className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-4 md:p-6"
            style={{
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Mobile sidebar toggle */}
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12h18M3 6h18M3 18h18" />
                  </svg>
                </button>

                <div
                  className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, var(--coral-500) 0%, var(--coral-600) 100%)',
                    boxShadow: '0 4px 12px rgba(217, 107, 79, 0.25)',
                  }}
                >
                  <BookIcon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>

                <div>
                  <h1
                    className="text-xl md:text-2xl font-semibold tracking-tight"
                    style={{
                      fontFamily: 'var(--font-display)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Day Chat Playground
                  </h1>
                  <p
                    className="text-xs md:text-sm mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    分析你的英语对话，获取个性化学习建议
                  </p>
                </div>
              </div>

              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                style={{
                  color: 'var(--forest-600)',
                  background: 'var(--sage-100)',
                }}
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span className="hidden md:inline">返回聊天</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Area */}
        <main className="flex-1 overflow-y-auto px-4 md:px-6 pb-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Input Section */}
            <ChatHistoryInput
              value={chatHistory}
              onChange={setChatHistory}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              disabled={isAnalyzing}
            />

            {/* Analysis Result */}
            <AnalysisDisplay
              analysis={analysis}
              isLoading={isAnalyzing}
              error={error}
            />

            {/* Takeaway Section - show only when there's an analysis */}
            {(analysis || currentRecord) && (
              <TakeawaySection
                takeaway={currentTakeaway}
                onSave={handleSaveTakeaway}
                disabled={!currentRecord}
                exportCardRef={exportCardRef}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
