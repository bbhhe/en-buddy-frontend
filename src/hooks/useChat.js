import { useState, useCallback, useRef } from 'react';
import { chatStream, clearMemory } from '../api/chat';

const generateSessionId = () => `user-${Date.now()}`;

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const sessionIdRef = useRef(generateSessionId());

  const handleSendMessage = useCallback(async (content) => {
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

      await chatStream(sessionIdRef.current, content, (chunk) => {
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
  }, []);

  const handleClearMemory = useCallback(async () => {
    try {
      await clearMemory(sessionIdRef.current);
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear memory:', error);
    }
  }, []);

  return {
    messages,
    sendMessage: handleSendMessage,
    clearMemory: handleClearMemory,
    isLoading,
  };
}
