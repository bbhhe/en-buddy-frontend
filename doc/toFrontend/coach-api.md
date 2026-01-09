# Coach API 接口文档

## 概述

英语教练接口用于分析用户的英语对话记录，提供语法纠正、表达优化和学习建议。支持两种输出格式：
1. **流式 Markdown** (`/analyze`) - 实时展示分析报告
2. **结构化 JSON** (`/analyze-cards`) - 单词卡片数据，支持持久化

## 接口列表

### 1. 分析聊天记录 (Markdown 流式)

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

### 2. 分析聊天记录 (JSON 单词卡片)

分析用户提供的英语对话，返回结构化的单词卡片数据，可选持久化到数据库。

**请求**

```
POST /api/coach/analyze-cards
Content-Type: application/json
```

**请求参数**

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| chatHistory | string | 是 | - | 待分析的聊天记录文本，最大 50000 字符 |
| sessionId | string | 否 | null | 关联的会话 ID，用于追溯 |
| save | boolean | 否 | true | 是否持久化到数据库 |

**请求示例**

```json
{
    "chatHistory": "User: How do I get to the subway station?\nAI: You can take bus 101 or walk there. It's about 10 minutes.",
    "sessionId": "session-abc-123",
    "save": true
}
```

**响应**

返回 JSON 格式的单词卡片数据。

**响应参数**

| 字段 | 类型 | 说明 |
|------|------|------|
| cards | array | 单词卡片列表 |
| cards[].id | number | 卡片 ID（仅 save=true 时有值） |
| cards[].word | string | 英文单词或短语 |
| cards[].meaning | string | 中文释义 |
| cards[].contextScene | string | 使用场景描述 |
| cards[].originalSentence | string | 包含该词的原句 |
| cards[].tip | string | 学习小贴士 |
| savedCount | number | 成功保存到数据库的数量 |
| sessionId | string | 关联的会话 ID |

**响应示例**

```json
{
    "cards": [
        {
            "id": 1,
            "word": "get to",
            "meaning": "到达",
            "contextScene": "询问如何到达某个地点时使用",
            "originalSentence": "How do I get to the subway station?",
            "tip": "get to 比 arrive at 更口语化"
        },
        {
            "id": 2,
            "word": "subway station",
            "meaning": "地铁站",
            "contextScene": "描述交通目的地",
            "originalSentence": "How do I get to the subway station?",
            "tip": "美式用 subway，英式用 underground/tube"
        },
        {
            "id": 3,
            "word": "about",
            "meaning": "大约",
            "contextScene": "描述大概的时间或数量",
            "originalSentence": "It's about 10 minutes.",
            "tip": "about 可替换为 around 或 approximately"
        }
    ],
    "savedCount": 3,
    "sessionId": "session-abc-123"
}
```

**仅分析不保存 (save=false)**

```json
{
    "chatHistory": "User: What's the weather like?\nAI: It's sunny today.",
    "save": false
}
```

响应：
```json
{
    "cards": [
        {
            "id": null,
            "word": "What's ... like",
            "meaning": "...怎么样",
            "contextScene": "询问事物的状态或特征",
            "originalSentence": "What's the weather like?",
            "tip": "常用句型：What's + 名词 + like?"
        }
    ],
    "savedCount": 0,
    "sessionId": null
}
```

**错误响应**

| 状态码 | 场景 | 说明 |
|--------|------|------|
| 400 | chatHistory 为空或超长 | 参数校验失败 |
| 400 | 请求体格式错误 | JSON 解析失败 |
| 500 | 服务器内部错误 | AI 服务异常或数据库问题 |

---

## 前端处理示例

### JavaScript (Fetch + ReadableStream) - Markdown 流式

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

### JavaScript - JSON 单词卡片

```javascript
async function analyzeCards(chatHistory, sessionId = null, save = true) {
    const response = await fetch('/api/coach/analyze-cards', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ chatHistory, sessionId, save })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '请求失败');
    }

    return response.json();
}

// 使用示例
const result = await analyzeCards(
    "User: How do I get to the subway?\nAI: Take bus 101.",
    "session-123",
    true
);

console.log(`提取了 ${result.cards.length} 个单词`);
result.cards.forEach(card => {
    console.log(`${card.word} - ${card.meaning}`);
});

// 保存到本地单词本 (LocalStorage)
const vocabulary = JSON.parse(localStorage.getItem('vocabulary') || '[]');
vocabulary.push(...result.cards);
localStorage.setItem('vocabulary', JSON.stringify(vocabulary));
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

### React 单词卡片组件

```jsx
function VocabularyCard({ card, onFlip }) {
    const [flipped, setFlipped] = useState(false);

    // 生成完形填空句子
    const clozeText = card.originalSentence.replace(
        new RegExp(card.word, 'gi'),
        '_____'
    );

    return (
        <div
            className={`card ${flipped ? 'flipped' : ''}`}
            onClick={() => setFlipped(!flipped)}
        >
            {!flipped ? (
                // 正面：回忆区
                <div className="card-front">
                    <p className="context">{card.contextScene}</p>
                    <p className="cloze">{clozeText}</p>
                    <p className="hint">点击查看答案</p>
                </div>
            ) : (
                // 背面：强化区
                <div className="card-back">
                    <h3 className="word">{card.word}</h3>
                    <p className="meaning">{card.meaning}</p>
                    <p className="sentence">{card.originalSentence}</p>
                    <p className="tip">💡 {card.tip}</p>
                    <div className="feedback">
                        <button onClick={() => onFlip('remembered')}>记住了</button>
                        <button onClick={() => onFlip('forgot')}>没记住</button>
                    </div>
                </div>
            )}
        </div>
    );
}
```

---

## 分析报告结构 (Markdown 接口)

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

## 单词卡片结构 (JSON 接口)

| 字段 | 说明 | 前端用途 |
|------|------|----------|
| word | 英文单词/短语 | 卡片背面展示 |
| meaning | 中文释义 | 卡片背面展示 |
| contextScene | 场景描述 | 卡片正面展示，帮助回忆 |
| originalSentence | 原句 | 生成完形填空，卡片背面展示完整句子 |
| tip | 学习提示 | 卡片背面展示，帮助记忆 |

### 卡片展示建议

**正面 (回忆区)**:
- 展示 `contextScene`（场景描述）
- 展示 `originalSentence` 的完形填空版本（隐去 word）
- 用户尝试回忆单词

**背面 (强化区)**:
- 展示 `word` 和 `meaning`
- 展示完整的 `originalSentence`
- 展示 `tip`
- 提供"记住了/没记住"反馈按钮

---

## 两个接口的对比

| 特性 | /analyze | /analyze-cards |
|------|----------|----------------|
| 响应格式 | SSE Markdown 流 | JSON |
| 用途 | 实时分析报告展示 | 单词本卡片管理 |
| 数据持久化 | 不保存 | 可选保存到数据库 |
| 响应速度 | 流式即时 | 等待完整响应 |
| 适用场景 | 对话后即时反馈 | 单词提取和复习 |

---

## 注意事项

1. **输入限制**: chatHistory 最大 50000 字符，超出会返回 400 错误
2. **无状态**: 每次请求独立分析，不保存分析历史
3. **响应时间**:
   - `/analyze`: 流式响应，首个 token 通常 1-2 秒
   - `/analyze-cards`: 等待完整响应，通常 5-15 秒
4. **Markdown 渲染**: 前端需要使用 Markdown 渲染库（如 react-markdown、marked 等）显示分析结果
5. **单词去重**: 当前版本允许重复单词（不同场景的同一单词仍有学习价值）
