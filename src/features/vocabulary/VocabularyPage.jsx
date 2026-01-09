import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getVocabularyList } from '../../api/vocabulary';
import FlashCard from './FlashCard';

function BookIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    );
}

function ArrowLeftIcon({ className }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
    );
}

export default function VocabularyPage() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState('list'); // 'list' or 'review'
    const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

    const loadCards = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getVocabularyList();
            setCards(data);
        } catch (error) {
            console.error('Failed to load vocabulary:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadCards();
    }, [loadCards]);

    const getReviewQueue = () => {
        return cards.filter(c => c.status !== 'mastered');
    };

    const handleStartReview = () => {
        setMode('review');
        setCurrentReviewIndex(0);
    };

    const handleNextCard = () => {
        if (currentReviewIndex < getReviewQueue().length - 1) {
            setCurrentReviewIndex(prev => prev + 1);
        } else {
            alert("Review session complete!");
            setMode('list');
            loadCards(); // Refresh statuses
        }
    };

    const reviewQueue = getReviewQueue();

    return (
        <div className="min-h-screen font-sans text-gray-900 pb-20" style={{ background: 'transparent' }}>
            {/* Header */}
            <header className="sticky top-0 z-10">
                <div
                    className="mx-auto px-4 h-16 flex items-center justify-between backdrop-blur-md"
                    style={{
                        background: 'rgba(255, 255, 255, 0.8)',
                        borderBottom: '1px solid var(--border-light)'
                    }}
                >
                    <div className="max-w-4xl mx-auto w-full flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                                style={{
                                    background: 'linear-gradient(135deg, var(--forest-600) 0%, var(--forest-700) 100%)',
                                    boxShadow: '0 4px 12px rgba(45, 90, 74, 0.25)'
                                }}
                            >
                                <BookIcon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1
                                    className="text-lg font-bold"
                                    style={{
                                        fontFamily: 'var(--font-display)',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    Vocabulary Book
                                </h1>
                                <p
                                    className="text-xs"
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    {cards.length} words collected
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/"
                            className="p-2 rounded-full transition-colors hover:bg-black/5"
                        >
                            <ArrowLeftIcon className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'var(--forest-600)' }}></div>
                    </div>
                ) : mode === 'list' ? (
                    <div className="space-y-6">
                        {/* Stats / Action Card */}
                        <div
                            className="rounded-3xl p-8 text-white relative overflow-hidden shadow-xl"
                            style={{
                                background: 'linear-gradient(135deg, var(--forest-700) 0%, var(--forest-900) 100%)',
                                boxShadow: 'var(--shadow-lg)'
                            }}
                        >
                            <div className="relative z-10">
                                <h2
                                    className="text-3xl font-bold mb-2"
                                    style={{ fontFamily: 'var(--font-display)' }}
                                >
                                    Ready to review?
                                </h2>
                                <p className="mb-6 opacity-90">You have {reviewQueue.length} words to review.</p>
                                <button
                                    onClick={handleStartReview}
                                    disabled={reviewQueue.length === 0}
                                    className="px-6 py-3 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                    style={{
                                        background: 'var(--cream-100)',
                                        color: 'var(--forest-800)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    Start Flashcards
                                </button>
                            </div>

                            {/* Decorative Circles */}
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 rounded-full blur-3xl opacity-20 bg-white"></div>
                            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 rounded-full blur-2xl opacity-20 bg-emerald-400"></div>
                        </div>

                        {/* Word List */}
                        <div className="space-y-4">
                            <h3
                                className="text-sm font-bold uppercase tracking-wider"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                All Words
                            </h3>
                            {cards.length === 0 ? (
                                <div className="text-center py-10" style={{ color: 'var(--text-muted)' }}>
                                    No words saved yet. Go chat and analyze to add some!
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {cards.map(card => (
                                        <div
                                            key={card.id}
                                            className="p-4 rounded-xl flex items-center justify-between group transition-all duration-200"
                                            style={{
                                                background: 'white',
                                                border: '1px solid var(--border-light)',
                                                boxShadow: 'var(--shadow-sm)'
                                            }}
                                        >
                                            <div>
                                                <h4
                                                    className="text-lg font-semibold"
                                                    style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                                                >
                                                    {card.word}
                                                </h4>
                                                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{card.meaning}</p>
                                            </div>
                                            <div
                                                className="px-2 py-1 rounded-md text-xs font-medium"
                                                style={{
                                                    backgroundColor: card.status === 'new' ? 'var(--cream-200)' :
                                                        card.status === 'remembered' ? 'var(--sage-200)' : 'var(--cream-100)',
                                                    color: card.status === 'new' ? 'var(--ink-700)' :
                                                        card.status === 'remembered' ? 'var(--forest-700)' : 'var(--text-muted)'
                                                }}
                                            >
                                                {card.status}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Review Mode */
                    <div className="max-w-2xl mx-auto py-8">
                        <div className="mb-6 flex items-center justify-between text-sm">
                            <button
                                onClick={() => setMode('list')}
                                className="hover:underline"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                key: ESC / Cancel
                            </button>
                            <span style={{ color: 'var(--text-muted)' }}>{currentReviewIndex + 1} / {reviewQueue.length}</span>
                        </div>

                        {reviewQueue[currentReviewIndex] && (
                            <FlashCard
                                card={reviewQueue[currentReviewIndex]}
                                onNext={handleNextCard}
                            />
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
