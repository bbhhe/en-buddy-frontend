import { useState, useCallback } from 'react';
import { analyzeStream } from '../api/coach';

/**
 * Hook for analyzing chat history with the Coach API
 */
export function useCoach() {
  const [analysis, setAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const analyzeChat = useCallback(async (chatHistory) => {
    if (!chatHistory.trim()) {
      setError('请粘贴聊天记录后再分析');
      return null;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis('');

    try {
      const result = await analyzeStream(chatHistory, (chunk, fullContent) => {
        setAnalysis(fullContent);
      });
      return result;
    } catch (err) {
      console.error('分析失败:', err);
      setError(err.message || '分析失败，请重试');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearAnalysis = useCallback(() => {
    setAnalysis('');
    setError(null);
  }, []);

  const setAnalysisContent = useCallback((content) => {
    setAnalysis(content);
  }, []);

  return {
    analysis,
    isAnalyzing,
    error,
    analyzeChat,
    clearAnalysis,
    setAnalysisContent,
  };
}
