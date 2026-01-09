import { useState } from 'react';
import { updateCardStatus } from '../../api/vocabulary';

export default function FlashCard({ card, onNext }) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleStatusUpdate = async (status) => {
        setIsUpdating(true);
        try {
            await updateCardStatus(card.id, status);
            // Wait a tiny bit for visual feedback
            setTimeout(() => {
                setIsFlipped(false);
                onNext();
                setIsUpdating(false);
            }, 300);
        } catch (error) {
            console.error('Failed to update status:', error);
            setIsUpdating(false);
        }
    };

    // Create cloze sentence (replace word with underscores)
    const getClozeSentence = () => {
        if (!card.originalSentence || !card.word) return '';
        // Simple case-insensitive replacement
        const regex = new RegExp(card.word, 'gi');
        return card.originalSentence.replace(regex, '______');
    };

    return (
        <div className="w-full max-w-xl mx-auto perspective-1000">
            <div
                className={`relative w-full aspect-[4/3] md:aspect-[16/9] transition-all duration-500 transform preserve-3d cursor-pointer ${isFlipped ? 'rotate-y-180' : ''}`}
                onClick={() => !isFlipped && setIsFlipped(true)}
            >
                {/* Front Side */}
                <div
                    className="absolute inset-0 backface-hidden backdrop-blur-md rounded-3xl p-8 flex flex-col items-center justify-center border transition-shadow"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.95) 100%)',
                        borderColor: 'var(--border-light)',
                        boxShadow: 'var(--shadow-xl)'
                    }}
                >
                    <div
                        className="absolute top-6 left-6 flex items-center gap-2 text-sm font-medium"
                        style={{ color: 'var(--forest-600)' }}
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>Context Scene</span>
                    </div>

                    <div className="text-center space-y-8 max-w-lg">
                        <p className="text-lg italic" style={{ color: 'var(--text-secondary)' }}>
                            "{card.contextScene}"
                        </p>

                        <h3
                            className="text-2xl md:text-3xl font-medium leading-relaxed"
                            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}
                        >
                            {getClozeSentence()}
                        </h3>
                    </div>

                    <div
                        className="absolute bottom-6 text-sm animate-bounce"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        Tap to reveal
                    </div>
                </div>

                {/* Back Side */}
                <div
                    className="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-3xl p-8 flex flex-col justify-between border"
                    onClick={(e) => e.stopPropagation()} // Prevent flipping back when clicking controls
                    style={{
                        boxShadow: 'var(--shadow-xl)',
                        borderColor: 'var(--border-light)'
                    }}
                >
                    <div className="text-center mt-4">
                        <h2
                            className="text-4xl font-bold mb-2"
                            style={{ color: 'var(--forest-800)', fontFamily: 'var(--font-display)' }}
                        >
                            {card.word}
                        </h2>
                        <p className="text-xl mb-6" style={{ color: 'var(--text-secondary)' }}>{card.meaning}</p>

                        <div
                            className="rounded-xl p-4 mb-4"
                            style={{ background: 'var(--sage-100)' }}
                        >
                            <p className="text-lg mb-2" style={{ color: 'var(--text-primary)' }}>{card.originalSentence}</p>
                            {card.tip && (
                                <p className="text-sm flex items-center justify-center gap-1.5" style={{ color: 'var(--coral-500)' }}>
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <path d="M12 16v-4"></path>
                                        <path d="M12 8h.01"></path>
                                    </svg>
                                    {card.tip}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-auto">
                        <button
                            onClick={() => handleStatusUpdate('new')} // Keep in queue
                            disabled={isUpdating}
                            className="py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 hover:bg-opacity-80"
                            style={{ color: 'var(--coral-600)', background: 'var(--cream-200)' }}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <path d="M18 6L6 18M6 6l12 12"></path>
                            </svg>
                            Forgot
                        </button>
                        <button
                            onClick={() => handleStatusUpdate('remembered')} // Mark as remembered
                            disabled={isUpdating}
                            className="py-3 px-4 rounded-xl font-medium text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                                background: 'linear-gradient(135deg, var(--forest-600) 0%, var(--forest-700) 100%)',
                                boxShadow: '0 4px 12px rgba(45, 90, 74, 0.25)'
                            }}
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
        </div>
    );
}
