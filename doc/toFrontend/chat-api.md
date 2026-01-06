# Chat API 接口文档

## 概述

聊天接口支持流式响应和会话记忆功能，AI 能够记住同一会话中的对话历史。

## 接口列表

### 1. 流式聊天

发送消息并获取 AI 的流式响应。

**请求**

```
POST /api/chat/stream
Content-Type: application/json
Accept: text/event-stream
```

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| sessionId | string | 否 | 会话ID，用于区分不同对话。相同 sessionId 的请求共享对话历史。如不传则自动生成新会话。 |
| message | string | 是 | 用户消息内容 |

**请求示例**

```json
{
    "sessionId": "user-123-session-1",
    "message": "你好，我叫小明"
}
```

**响应**

返回 `text/event-stream` 格式的流式数据。

**响应格式**

每个 SSE 事件格式为：
```
data:这是AI回复的文本片段

```

- 每个 `data:` 后面紧跟一段文本（AI 回复的一部分）
- 每个事件以两个换行符结束
- 流结束后连接自动关闭

**完整响应示例**

```
data:你好

data:，

data:我是

data:AI助手

data:！

```

最终拼接得到完整回复：`你好，我是AI助手！`

**错误响应**

| 状态码 | 场景 | 说明 |
|--------|------|------|
| 400 | 请求体格式错误 | JSON 解析失败 |
| 500 | 服务器内部错误 | AI 服务异常或网络问题 |

错误时返回 JSON 格式：
```json
{
    "timestamp": "2024-01-15T10:30:00.000+00:00",
    "status": 500,
    "error": "Internal Server Error",
    "path": "/api/chat/stream"
}
```

**前端处理示例 (JavaScript)**

```javascript
async function chatStream(sessionId, message, onChunk) {
    const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ sessionId, message })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '请求失败');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        // 解析 SSE 格式：提取 data: 后面的内容
        const lines = chunk.split('\n');
        for (const line of lines) {
            if (line.startsWith('data:')) {
                const text = line.slice(5); // 去掉 "data:" 前缀
                fullText += text;
                onChunk?.(text, fullText);
            }
        }
    }

    return fullText;
}

// 使用示例
const result = await chatStream('session-1', '你好', (chunk, fullText) => {
    console.log('收到片段:', chunk);
    console.log('当前完整内容:', fullText);
});
```

**使用 EventSource (SSE) 示例**

```javascript
// 注意：EventSource 仅支持 GET 请求，如需使用 POST，请用 fetch + ReadableStream
const eventSource = new EventSource('/api/chat/stream?sessionId=xxx&message=hello');

eventSource.onmessage = (event) => {
    console.log('Received:', event.data);
};

eventSource.onerror = (error) => {
    console.error('Error:', error);
    eventSource.close();
};
```

---

### 2. 清除会话记忆

清除指定会话的对话历史。

**请求**

```
DELETE /api/chat/memory/{sessionId}
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| sessionId | string | 要清除的会话ID |

**请求示例**

```
DELETE /api/chat/memory/user-123-session-1
```

**响应**

无响应体，状态码 200 表示成功。

| 状态码 | 说明 |
|--------|------|
| 200 | 清除成功（即使 sessionId 不存在也返回 200） |

---

## 会话记忆说明

### 工作原理

1. 前端在请求中传入 `sessionId` 标识会话
2. 后端使用该 ID 维护对话历史
3. 每次请求时，AI 会基于完整对话历史生成回复
4. 每个会话默认保留最近 20 条消息

### sessionId 设计建议

建议 sessionId 格式：`{userId}-{timestamp}` 或 `{userId}-{conversationId}`

示例：
- `user123-1704067200000`
- `user123-conv-abc123`

### 使用场景

**场景1：新建对话**
```javascript
// 不传 sessionId，后端自动生成新会话
const response = await chatStream(null, "你好");
```

**场景2：继续对话**
```javascript
// 使用相同 sessionId 继续对话
const sessionId = "user-123-session-1";
await chatStream(sessionId, "你好，我叫小明");
await chatStream(sessionId, "你还记得我叫什么吗？"); // AI 会记住用户叫小明
```

**场景3：开始新话题**
```javascript
// 清除旧记忆后重新开始
await fetch(`/api/chat/memory/${sessionId}`, { method: 'DELETE' });
await chatStream(sessionId, "让我们聊点别的");
```

---

## 注意事项

1. **记忆持久性**：当前记忆存储在内存中，服务重启后会丢失
2. **并发安全**：同一 sessionId 的并发请求是线程安全的
3. **消息限制**：每个会话保留最近 20 条消息，超出后自动移除最早的消息
