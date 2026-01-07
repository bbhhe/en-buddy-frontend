# Coach API 接口文档

## 概述

英语教练接口用于分析用户的英语对话记录，提供语法纠正、表达优化和学习建议。支持流式响应，返回 Markdown 格式的分析报告。

## 接口列表

### 1. 分析聊天记录

分析用户提供的英语对话，流式返回 Markdown 格式的专业分析报告。

**请求**

```
POST /api/coach/analyze
Content-Type: application/json
Accept: text/event-stream
```

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| chatHistory | string | 是 | 待分析的聊天记录文本，最大 50000 字符 |

**请求示例**

```json
{
    "chatHistory": "User: Hi, how are you today?\nAI: I'm doing great! How about you?\nUser: I very happy because I passed my exam.\nAI: Congratulations! That's wonderful news!"
}
```

**响应**

返回 `text/event-stream` 格式的流式数据，内容为 Markdown 格式的分析报告。

**响应格式**

每个 SSE 事件格式为：
```
data:## 语法分析

data:### 语法错误

```

- 每个 `data:` 后面紧跟一段 Markdown 文本
- 流结束后连接自动关闭
- 最终拼接所有片段得到完整的 Markdown 分析报告

**完整响应示例**

```
data:## 语法分析

data:### 语法错误
data:- **原句**: I very happy because I passed my exam.
data:  - **问题**: 缺少系动词 "am"
data:  - **修正**: I am very happy because I passed my exam.
data:  - **解释**: 在英语中，形容词作表语时需要 be 动词

data:### 语法亮点
data:- 正确使用了过去式 "passed"，时态使用准确

data:## 表达优化
...
```

**错误响应**

| 状态码 | 场景 | 说明 |
|--------|------|------|
| 400 | chatHistory 为空或超长 | 参数校验失败 |
| 400 | 请求体格式错误 | JSON 解析失败 |
| 500 | 服务器内部错误 | AI 服务异常或网络问题 |

错误时返回 JSON 格式：
```json
{
    "timestamp": "2024-01-15T10:30:00.000+00:00",
    "status": 400,
    "error": "Bad Request",
    "path": "/api/coach/analyze"
}
```

---

## 前端处理示例

### JavaScript (Fetch + ReadableStream)

```javascript
async function analyzeChat(chatHistory, onChunk) {
    const response = await fetch('/api/coach/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ chatHistory })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '请求失败');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullMarkdown = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        // 解析 SSE 格式：提取 data: 后面的内容
        const lines = chunk.split('\n');
        for (const line of lines) {
            if (line.startsWith('data:')) {
                const text = line.slice(5); // 去掉 "data:" 前缀
                fullMarkdown += text;
                onChunk?.(text, fullMarkdown);
            }
        }
    }

    return fullMarkdown;
}

// 使用示例
const chatHistory = `User: Hi, how are you?
AI: I'm good! How about you?
User: I very happy today.
AI: That's great to hear!`;

const result = await analyzeChat(chatHistory, (chunk, fullMarkdown) => {
    console.log('收到片段:', chunk);
    // 实时渲染 Markdown
    document.getElementById('analysis').innerHTML = renderMarkdown(fullMarkdown);
});
```

### React 示例

```jsx
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

function CoachAnalysis({ chatHistory }) {
    const [analysis, setAnalysis] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        setAnalysis('');

        try {
            await analyzeChat(chatHistory, (chunk, fullMarkdown) => {
                setAnalysis(fullMarkdown);
            });
        } catch (error) {
            console.error('分析失败:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <button onClick={handleAnalyze} disabled={loading}>
                {loading ? '分析中...' : '开始分析'}
            </button>
            <div className="analysis-result">
                <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
        </div>
    );
}
```

---

## 分析报告结构

返回的 Markdown 分析报告包含以下部分：

### 1. 语法分析

- **语法错误**: 列出对话中的语法问题，包含原句、问题描述、修正建议和解释
- **语法亮点**: 肯定用户做得好的语法使用

### 2. 表达优化

- **可改进的表达**: 提供更地道的表达方式
- **亮点表达**: 肯定用户使用的好表达

### 3. 学习建议

- **本次对话总结**: 整体评价
- **推荐学习重点**: 具体的学习建议
- **实用短语推荐**: 推荐日常对话中常用的表达

---

## 与 Chat 接口的区别

| 特性 | Chat 接口 | Coach 接口 |
|------|-----------|------------|
| 用途 | AI 对话 | 分析对话质量 |
| 会话记忆 | 需要 sessionId | 不需要 |
| 输入 | 单条消息 | 完整对话记录 |
| 输出 | AI 对话回复 | Markdown 分析报告 |
| 每次请求 | 可继续对话 | 独立分析 |

---

## 注意事项

1. **输入限制**: chatHistory 最大 50000 字符，超出会返回 400 错误
2. **无状态**: 每次请求独立分析，不保存历史
3. **响应时间**: 由于需要全面分析，响应时间可能较长（通常 5-15 秒）
4. **Markdown 渲染**: 前端需要使用 Markdown 渲染库（如 react-markdown、marked 等）显示分析结果
