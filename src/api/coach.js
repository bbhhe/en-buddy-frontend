import { API_BASE_URL } from './index';

/**
 * 分析聊天记录，流式返回 Markdown 格式的分析报告
 * @param {string} chatHistory - 待分析的聊天记录文本
 * @param {function} onChunk - 每次收到数据块时的回调
 * @returns {Promise<string>} - 完整的分析结果
 */
export const analyzeStream = async (chatHistory, onChunk) => {
  const response = await fetch(`${API_BASE_URL}/api/coach/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({ chatHistory }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullContent = '';

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
        // 空的 data: 行表示换行符
        const content = text === '' ? '\n' : text;
        fullContent += content;
        onChunk?.(content, fullContent);
      }
    }
  }

  // Process any remaining buffer content
  if (buffer.trim().startsWith('data:')) {
    const text = buffer.trim().slice(5);
    const content = text === '' ? '\n' : text;
    fullContent += content;
    onChunk?.(content, fullContent);
  }

  return fullContent;
};
