import { useState, useRef, useEffect } from 'react';

// Icons
function PlusIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    );
}

function TrashIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </svg>
    );
}

function EditIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}

function CheckIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function XIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

// Helper to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 7) return `${diffDays} 天前`;
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

function ConversationItem({ conversation, isActive, onSelect, onDelete, onRename }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(conversation.title);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = (e) => {
        e.stopPropagation();
        if (editTitle.trim() && editTitle !== conversation.title) {
            onRename(conversation.id, editTitle);
        }
        setIsEditing(false);
    };

    const handleCancel = (e) => {
        e.stopPropagation();
        setEditTitle(conversation.title);
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSave(e);
        if (e.key === 'Escape') handleCancel(e);
    };

    return (
        <div
            onClick={() => !isEditing && onSelect(conversation)}
            className={`group relative p-3 rounded-xl cursor-pointer transition-all ${isActive ? 'bg-[var(--sage-100)] border-[var(--sage-200)]' : 'hover:bg-gray-50 border-transparent'
                } border`}
        >
            <div className="flex items-center justify-between gap-2">
                {isEditing ? (
                    <div className="flex-1 flex items-center gap-1 min-w-0" onClick={(e) => e.stopPropagation()}>
                        <input
                            ref={inputRef}
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="flex-1 text-sm bg-white border border-gray-300 rounded px-1 py-0.5 outline-none focus:border-[var(--forest-600)]"
                        />
                        <button onClick={handleSave} className="p-1 text-green-600 hover:bg-green-50 rounded">
                            <CheckIcon className="w-4 h-4" />
                        </button>
                        <button onClick={handleCancel} className="p-1 text-gray-500 hover:bg-gray-100 rounded">
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium truncate text-[var(--text-primary)]">
                            {conversation.title || 'New Chat'}
                        </h3>
                        <p className="text-xs mt-0.5 text-[var(--text-muted)]">
                            {formatDate(conversation.updatedAt)}
                        </p>
                    </div>
                )}

                {!isEditing && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--forest-600)] hover:bg-gray-100 transition-colors"
                            title="重命名"
                        >
                            <EditIcon className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(conversation.id);
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-[var(--coral-600)] hover:bg-[rgba(217,107,79,0.1)] transition-colors"
                            title="删除"
                        >
                            <TrashIcon className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ConversationSidebar({
    conversations,
    currentConversationId,
    onSelectConversation,
    onCreateConversation,
    onDeleteConversation,
    onRenameConversation,
    isOpen,
    onToggle,
    isLoading,
    error // New prop
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
          h-full w-72 flex flex-col
          bg-[var(--cream-50)] border-r border-[var(--border-light)]
          transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-r-0 md:overflow-hidden'}
        `}
            >
                <div className="p-4 flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-base font-semibold font-[var(--font-display)] text-[var(--text-primary)]">
                            历史会话
                        </h2>
                        <button
                            onClick={onToggle}
                            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* New Chat Button */}
                    <button
                        onClick={onCreateConversation}
                        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-white transition-all mb-4 hover:brightness-110 active:scale-[0.98]"
                        style={{
                            background: 'linear-gradient(135deg, var(--forest-600) 0%, var(--forest-700) 100%)',
                            boxShadow: '0 4px 12px rgba(45, 90, 74, 0.25)',
                        }}
                    >
                        <PlusIcon className="w-4 h-4" />
                        新话题
                    </button>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto -mx-2 px-2 space-y-1">
                        {isLoading ? (
                            <div className="flex justify-center py-4">
                                <div className="w-5 h-5 border-2 border-[var(--forest-600)] border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : error ? (
                            <div className="text-center py-8 px-4 text-sm text-[var(--coral-600)]">
                                <p>无法加载会话列表</p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="mt-2 text-[var(--forest-600)] underline hover:text-[var(--forest-700)]"
                                >
                                    刷新重试
                                </button>
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="text-center py-8 text-sm text-[var(--text-muted)]">
                                暂无历史记录
                            </div>
                        ) : (
                            conversations.map((conv) => (
                                <ConversationItem
                                    key={conv.id}
                                    conversation={conv}
                                    isActive={conv.id === currentConversationId}
                                    onSelect={onSelectConversation}
                                    onDelete={onDeleteConversation}
                                    onRename={onRenameConversation}
                                />
                            ))
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}
