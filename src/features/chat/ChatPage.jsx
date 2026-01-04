import { useState, useRef, useEffect } from 'react';
import ChatInput from './ChatInput';
import MessageList from './MessageList';
import { useChat } from '../../hooks/useChat';

export default function ChatPage() {
  const { messages, sendMessage, isLoading } = useChat();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto">
      <header className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold">En-Buddy Chat</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </footer>
    </div>
  );
}
