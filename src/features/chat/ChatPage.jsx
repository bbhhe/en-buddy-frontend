import { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ChatInput from './ChatInput';
import MessageList from './MessageList';
import ConversationSidebar from './ConversationSidebar';
import { useChat } from '../../hooks/useChat';
import {
  getConversations,
  createConversation,
  deleteConversation,
  renameConversation,
  getConversationMessages
} from '../../api/conversation';

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

function MenuIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
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
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarLoading, setSidebarLoading] = useState(false);
  const [sidebarError, setSidebarError] = useState(null); // Add error state

  // Initialize useChat with current session ID
  const { messages, setMessages, sendMessage, isLoading, clearMemory } = useChat(
    currentConversation?.sessionId || null
  );

  const messagesEndRef = useRef(null);
  const mainRef = useRef(null);

  // Load conversations on mount
  const refreshConversations = useCallback(async () => {
    try {
      setSidebarLoading(true);
      setSidebarError(null);
      const data = await getConversations(0, 50); // Fetch first 50 for now
      setConversations(data.content);

      // Select first conversation if none selected and not empty
      if (!currentConversation && data.content.length > 0) {
        handleSelectConversation(data.content[0]);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setSidebarError(error); // Set error state
    } finally {
      setSidebarLoading(false);
    }
  }, [currentConversation]);

  useEffect(() => {
    // Initial load
    (async () => {
      try {
        setSidebarLoading(true);
        setSidebarError(null);
        const data = await getConversations(0, 50);
        setConversations(data.content);

        // Auto-select most recent
        if (data.content.length > 0) {
          handleSelectConversation(data.content[0]);
        } else {
          // If no conversations, create one automatically? Or just wait for user.
          // Let's create one automatically for better UX
          // handleCreateConversation(); // Don't auto-create if we might be erroring, or if we want empty state
          // Actually, if distinct from error, empty is fine. 
          // But if error, handleCreateConversation might also fail.
          if (data.content.length === 0) {
            handleCreateConversation().catch(() => { });
          }
        }
      } catch (error) {
        console.error('Initial load failed:', error);
        setSidebarError(error);
      } finally {
        setSidebarLoading(false);
      }
    })();
  }, []);

  const handleSelectConversation = async (conversation) => {
    setCurrentConversation(conversation);
    setMessages([]); // Clear messages immediately to avoid showing old chat
    setIsSidebarOpen(false); // Close sidebar on mobile

    try {
      const msgs = await getConversationMessages(conversation.id);
      // Map backend format to frontend format
      const mappedMessages = msgs.map(msg => ({
        id: msg.id, // Keep backend ID
        role: msg.type === 'USER' ? 'user' : 'assistant', // Map types
        content: msg.content
      }));
      setMessages(mappedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
      setMessages([]); // Fallback to empty
    }
  };

  const handleCreateConversation = async () => {
    try {
      const newConv = await createConversation();
      setConversations(prev => [newConv, ...prev]);
      setCurrentConversation(newConv);
      setMessages([]); // Clear messages for new chat
      setIsSidebarOpen(false);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  const handleDeleteConversation = async (id) => {
    if (!window.confirm('确定要删除这个会话吗？删除后无法恢复。')) return;

    try {
      await deleteConversation(id);
      setConversations(prev => prev.filter(c => c.id !== id));

      // If deleted current, switch to another
      if (currentConversation?.id === id) {
        const remaining = conversations.filter(c => c.id !== id);
        if (remaining.length > 0) {
          handleSelectConversation(remaining[0]);
        } else {
          handleCreateConversation();
        }
      }
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  };

  const handleRenameConversation = async (id, title) => {
    try {
      await renameConversation(id, title);
      setConversations(prev => prev.map(c =>
        c.id === id ? { ...c, title } : c
      ));
      if (currentConversation?.id === id) {
        setCurrentConversation(prev => ({ ...prev, title }));
      }
    } catch (error) {
      console.error('Failed to rename conversation:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message sent - maybe refresh list to show updated preview/timestamp?
  // We can do this lazily or periodically. For now, let's not spam the API.

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-900">
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversation?.id}
        onSelectConversation={handleSelectConversation}
        onCreateConversation={handleCreateConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isLoading={sidebarLoading}
        error={sidebarError}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        {/* Mobile Header Toggle */}
        <div className="md:hidden absolute top-4 left-4 z-30">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-white rounded-lg shadow-sm border border-gray-200"
          >
            <MenuIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div
          className="flex flex-col h-full max-w-3xl mx-auto px-4 py-6 md:py-8 w-full"
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {/* Header */}
          <header className="animate-fade-in mb-6 md:mb-8 pl-12 md:pl-0 transition-all duration-300">
            <div
              className="relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 md:p-8"
              style={{
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border-light)',
              }}
            >
              <QuoteDecoration />

              {/* Logo & Title */}
              <div className="flex items-center justify-between">
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
                      className="text-sm mt-0.5 truncate max-w-[200px] md:max-w-xs"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {currentConversation?.title || 'Chat with AI'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to="/playground"
                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hidden md:block"
                    style={{
                      color: 'var(--forest-600)',
                      background: 'var(--sage-100)',
                    }}
                  >
                    Playground
                  </Link>
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
            {/* Show welcome message if empty */}
            {messages.length === 0 && !isLoading && (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                <p>Start a new conversation!</p>
              </div>
            )}

            <MessageList messages={messages} isLoading={isLoading} />
            <div ref={messagesEndRef} className="h-4" />
          </main>

          {/* Input Area */}
          <footer className="mt-4 animate-fade-in stagger-3">
            <ChatInput onSend={sendMessage} disabled={isLoading || !currentConversation} />
          </footer>
        </div>
      </div>
    </div>
  );
}
