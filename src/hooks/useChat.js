import { useState, useCallback, useRef, useEffect } from 'react';
import { chatStream, clearMemory } from '../api/chat';

export function useChat(activeSessionId) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use activeSessionId if provided, otherwise fallback to local ref (for backward compatibility or new unsaved chats)
  // However, for the new design, we really want to rely on activeSessionId.
  // If activeSessionId is null, we can't really chat essentially, or we generate one temporarily?
  // Let's assume the consumer handles session creation if needed, or passes a temporary ID.

  const handleSendMessage = useCallback(async (content) => {
    const currentSessionId = activeSessionId;

    if (!currentSessionId) {
      console.error("No active session ID");
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    const assistantMessageId = Date.now() + 1;

    try {
      let fullContent = '';

      await chatStream(currentSessionId, content, (chunk) => {
        fullContent += chunk;

        setMessages((prev) => {
          // Check if assistant message already exists in the array
          const existingIndex = prev.findIndex((msg) => msg.id === assistantMessageId);

          if (existingIndex === -1) {
            // First chunk - add new assistant message
            return [
              ...prev,
              {
                id: assistantMessageId,
                role: 'assistant',
                content: fullContent,
              },
            ];
          }

          // Otherwise update the existing message
          return prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: fullContent }
              : msg
          );
        });
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages((prev) => {
        const messageExists = prev.some((msg) => msg.id === assistantMessageId);
        if (messageExists) {
          return prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: msg.content + '\n\n(Error: Failed to complete response)' }
              : msg
          );
        }
        return [
          ...prev,
          {
            id: assistantMessageId,
            role: 'assistant',
            content: '(Error: Failed to complete response)',
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  }, [activeSessionId]);

  const handleClearMemory = useCallback(async () => {
    if (!activeSessionId) return;
    try {
      await clearMemory(activeSessionId);
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear memory:', error);
    }
  }, [activeSessionId]);

  return {
    messages,
    setMessages, // Exposed for loading history
    sendMessage: handleSendMessage,
    clearMemory: handleClearMemory,
    isLoading,
  };
}
