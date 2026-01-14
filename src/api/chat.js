import api, { API_BASE_URL } from './index';

export const chatStream = async (sessionId, message, onChunk) => {
  const response = await fetch(`${API_BASE_URL}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({ sessionId, message }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    buffer += chunk;
    const lines = buffer.split('\n');

    // Keep the last line in the buffer as it might be incomplete
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim().startsWith('data:')) {
        const text = line.trim().slice(5);
        onChunk(text);
      }
    }
  }

  // Process any remaining buffer content
  if (buffer.trim().startsWith('data:')) {
    const text = buffer.trim().slice(5);
    onChunk(text);
  }
};

export const clearMemory = async (sessionId) => {
  return api.delete(`/chat/memory/${sessionId}`);
};

export const sendMessage = async (message) => {
  const response = await api.post('/chat', { message });
  return response.data;
};
