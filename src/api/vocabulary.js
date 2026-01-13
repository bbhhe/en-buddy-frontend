import api from './index';

// Toggle this to false when backend is ready
const ENABLE_MOCK = false;

const mockCards = [
    {
        id: 1,
        word: "get to",
        meaning: "到达",
        contextScene: "询问如何到达某个地点时使用",
        originalSentence: "How do I get to the subway station?",
        tip: "get to 比 arrive at 更口语化",
        status: "new",
        createdAt: Date.now()
    },
    {
        id: 2,
        word: "recommend",
        meaning: "推荐",
        contextScene: "讨论餐厅选择时",
        originalSentence: "Can you recommend a good Italian restaurant nearby?",
        tip: "后面常接名词或动名词",
        status: "remembered",
        createdAt: Date.now() - 86400000
    }
];

export const analyzeAndSaveCards = async (sessionId, chatHistory) => {
    if (ENABLE_MOCK) {
        console.log('Mocking analyzeAndSaveCards:', { sessionId, chatHistory });
        await new Promise(resolve => setTimeout(resolve, 1500));
        return {
            cards: [
                {
                    word: "perspective",
                    meaning: "观点，视角",
                    contextScene: "Discussing different ways to solve a problem",
                    originalSentence: "From my perspective, this is the best solution.",
                    tip: "Formal way to say 'opinion'"
                },
                {
                    word: "efficient",
                    meaning: "高效的",
                    contextScene: "Talking about work productivity",
                    originalSentence: "We need to find a more efficient way to work.",
                    tip: "Focuses on result/time ratio"
                }
            ],
            savedCount: 2,
            sessionId
        };
    }
    const response = await api.post('/api/coach/analyze-cards', { sessionId, chatHistory });
    return response.data;
};

export const getVocabularyList = async () => {
    if (ENABLE_MOCK) {
        console.log('Mocking getVocabularyList');
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockCards;
    }
    const response = await api.get('/api/vocabulary?userId=1');//userId 临时写成1
    return response.data;
};

export const updateCardStatus = async (id, status) => {
    if (ENABLE_MOCK) {
        console.log('Mocking updateCardStatus:', { id, status });
        const card = mockCards.find(c => c.id === id);
        if (card) card.status = status;
        return card;
    }
    const response = await api.put(`/api/vocabulary/${id}/status`, { status });
    return response.data;
};

export const deleteCard = async (id) => {
    if (ENABLE_MOCK) {
        console.log('Mocking deleteCard:', id);
        return true;
    }
    const response = await api.delete(`/api/vocabulary/${id}`);
    return response.data;
}
