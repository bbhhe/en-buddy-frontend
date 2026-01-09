# Vocabulary API 接口文档

## 概述

单词卡片管理接口用于查询和管理用户的单词卡片，支持获取单词列表和更新记忆状态。

## 接口列表

### 1. 获取单词卡片列表

获取指定用户的所有单词卡片，按创建时间倒序排列。

**请求**

```
GET /api/vocabulary?userId={userId}
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | string | 是 | 用户 ID (Query 参数) |

**响应**

返回 JSON 数组格式的单词卡片列表。

**响应参数**

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 卡片 ID |
| word | string | 英文单词或短语 |
| meaning | string | 中文释义 |
| contextScene | string | 使用场景描述 |
| originalSentence | string | 包含该词的原句 |
| tip | string | 学习小贴士 |
| status | string | 记忆状态: `new` (新卡片) 或 `remembered` (已记住) |
| createdAt | string | 创建时间 (ISO 8601 格式) |

**响应示例**

```json
[
    {
        "id": 1,
        "word": "get to",
        "meaning": "到达",
        "contextScene": "询问如何到达某个地点时使用",
        "originalSentence": "How do I get to the subway station?",
        "tip": "get to 比 arrive at 更口语化",
        "status": "new",
        "createdAt": "2024-01-15T10:30:00"
    },
    {
        "id": 2,
        "word": "subway station",
        "meaning": "地铁站",
        "contextScene": "描述交通目的地",
        "originalSentence": "How do I get to the subway station?",
        "tip": "美式用 subway，英式用 underground/tube",
        "status": "remembered",
        "createdAt": "2024-01-15T10:30:00"
    }
]
```

**错误响应**

| 状态码 | 场景 | 说明 |
|--------|------|------|
| 400 | userId 参数缺失 | 必须提供 userId 参数 |
| 500 | 服务器内部错误 | 数据库查询异常 |

---

### 2. 更新卡片记忆状态

更新单词卡片的记忆状态（从 `new` 变为 `remembered` 或反之）。

**请求**

```
PUT /api/vocabulary/{id}/status
Content-Type: application/json
```

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 卡片 ID |

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| status | string | 是 | 新状态，只能是 `new` 或 `remembered` |

**请求示例**

```json
{
    "status": "remembered"
}
```

**响应**

返回更新后的卡片对象。

**响应示例**

```json
{
    "id": 1,
    "word": "get to",
    "meaning": "到达",
    "contextScene": "询问如何到达某个地点时使用",
    "originalSentence": "How do I get to the subway station?",
    "tip": "get to 比 arrive at 更口语化",
    "status": "remembered",
    "createdAt": "2024-01-15T10:30:00"
}
```

**错误响应**

| 状态码 | 场景 | 说明 |
|--------|------|------|
| 400 | status 值无效 | status 只能是 `new` 或 `remembered` |
| 400 | status 为空 | status 不能为空 |
| 404 | 卡片不存在 | 找不到指定 ID 的卡片 |
| 500 | 服务器内部错误 | 数据库更新异常 |

错误响应示例：

```json
{
    "timestamp": "2024-01-15T10:30:00.000+00:00",
    "status": 400,
    "error": "Bad Request",
    "message": "status 只能是 new 或 remembered",
    "path": "/api/vocabulary/1/status"
}
```

---

## 前端处理示例

### JavaScript - 获取单词列表

```javascript
async function getVocabulary(userId) {
    const response = await fetch(`/api/vocabulary?userId=${encodeURIComponent(userId)}`);

    if (!response.ok) {
        throw new Error('获取单词列表失败');
    }

    return response.json();
}

// 使用示例
const cards = await getVocabulary('user-123');
console.log(`共有 ${cards.length} 个单词卡片`);

// 按状态分组
const newCards = cards.filter(c => c.status === 'new');
const rememberedCards = cards.filter(c => c.status === 'remembered');
console.log(`新卡片: ${newCards.length}, 已记住: ${rememberedCards.length}`);
```

### JavaScript - 更新卡片状态

```javascript
async function updateCardStatus(cardId, status) {
    const response = await fetch(`/api/vocabulary/${cardId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('卡片不存在');
        }
        const error = await response.json();
        throw new Error(error.message || '更新失败');
    }

    return response.json();
}

// 使用示例 - 标记为已记住
const updatedCard = await updateCardStatus(1, 'remembered');
console.log(`${updatedCard.word} 已标记为已记住`);
```

### React 单词卡片组件

```jsx
import { useState, useEffect } from 'react';

function VocabularyList({ userId }) {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getVocabulary(userId)
            .then(setCards)
            .finally(() => setLoading(false));
    }, [userId]);

    const handleStatusChange = async (cardId, newStatus) => {
        try {
            const updated = await updateCardStatus(cardId, newStatus);
            setCards(cards.map(c => c.id === cardId ? updated : c));
        } catch (error) {
            console.error('更新失败:', error);
        }
    };

    if (loading) return <div>加载中...</div>;

    return (
        <div className="vocabulary-list">
            {cards.map(card => (
                <VocabularyCard
                    key={card.id}
                    card={card}
                    onStatusChange={handleStatusChange}
                />
            ))}
        </div>
    );
}

function VocabularyCard({ card, onStatusChange }) {
    const [flipped, setFlipped] = useState(false);

    // 生成完形填空句子
    const clozeText = card.originalSentence.replace(
        new RegExp(card.word, 'gi'),
        '_____'
    );

    const handleRemembered = () => {
        onStatusChange(card.id, 'remembered');
    };

    const handleForgot = () => {
        onStatusChange(card.id, 'new');
    };

    return (
        <div
            className={`card ${flipped ? 'flipped' : ''} ${card.status}`}
            onClick={() => setFlipped(!flipped)}
        >
            {!flipped ? (
                // 正面：回忆区
                <div className="card-front">
                    <span className={`status-badge ${card.status}`}>
                        {card.status === 'new' ? '新' : '已掌握'}
                    </span>
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
                    <div className="feedback" onClick={e => e.stopPropagation()}>
                        <button onClick={handleRemembered}>记住了 ✓</button>
                        <button onClick={handleForgot}>没记住 ✗</button>
                    </div>
                </div>
            )}
        </div>
    );
}
```

### CSS 样式参考

```css
.vocabulary-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    padding: 16px;
}

.card {
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: transform 0.3s, box-shadow 0.3s;
    min-height: 200px;
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card.new {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.card.remembered {
    background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    color: white;
}

.status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    background: rgba(255, 255, 255, 0.2);
}

.word {
    font-size: 24px;
    margin-bottom: 8px;
}

.meaning {
    font-size: 18px;
    opacity: 0.9;
}

.feedback {
    display: flex;
    gap: 12px;
    margin-top: 16px;
}

.feedback button {
    flex: 1;
    padding: 10px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: bold;
}

.feedback button:first-child {
    background: #4CAF50;
    color: white;
}

.feedback button:last-child {
    background: #f44336;
    color: white;
}
```

---

## 状态说明

| 状态值 | 说明 | 使用场景 |
|--------|------|----------|
| `new` | 新卡片 | 刚创建或用户点击"没记住"后 |
| `remembered` | 已记住 | 用户点击"记住了"后 |

---

## 与 Coach API 的关系

| 接口 | 作用 | 备注 |
|------|------|------|
| `POST /api/coach/analyze-cards` | 分析对话并生成单词卡片 | 创建卡片，status 默认为 `new` |
| `GET /api/vocabulary` | 获取用户的所有卡片 | 读取卡片列表 |
| `PUT /api/vocabulary/{id}/status` | 更新卡片状态 | 管理学习进度 |

---

## 注意事项

1. **用户识别**: 当前使用 `userId` 查询参数，后续接入用户认证系统后将从 Token 中获取
2. **状态值限制**: status 只能是 `new` 或 `remembered`，其他值会返回 400 错误
3. **并发安全**: 更新操作基于卡片 ID，支持并发更新不同卡片
4. **响应时间**: 列表查询通常 < 100ms，状态更新通常 < 50ms
