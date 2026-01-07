# Conversation API 接口文档

## 概述

对话历史管理接口，用于管理用户的会话记录。支持会话列表查询、创建新会话、删除会话和重命名会话。

## 接口列表

### 1. 获取会话列表

获取用户的会话历史列表，按更新时间倒序排列。

**请求**

```
GET /api/conversations
```

**查询参数**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| page | int | 否 | 0 | 页码（从 0 开始） |
| size | int | 否 | 20 | 每页数量 |
| userId | string | 否 | - | 用户ID，用于过滤特定用户的会话（预留） |

**请求示例**

```
GET /api/conversations?page=0&size=10
```

**响应**

| 状态码 | 说明 |
|--------|------|
| 200 | 成功返回会话列表 |

**响应数据**

```json
{
  "content": [
    {
      "id": 1,
      "sessionId": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Travel Requirements",
      "lastMessagePreview": "Do I need a visa for Japan?",
      "messageCount": 5,
      "updatedAt": "2024-01-20T10:00:00"
    },
    {
      "id": 2,
      "sessionId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "title": "Grammar Practice",
      "lastMessagePreview": "What's the difference between...",
      "messageCount": 12,
      "updatedAt": "2024-01-19T15:30:00"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 100,
  "totalPages": 5,
  "first": true,
  "last": false,
  "empty": false
}
```

**响应字段说明**

| 字段 | 类型 | 说明 |
|------|------|------|
| content | array | 会话列表 |
| content[].id | number | 会话数据库ID |
| content[].sessionId | string | 会话唯一标识（UUID），用于聊天接口 |
| content[].title | string | 会话标题（AI 自动生成或用户修改） |
| content[].lastMessagePreview | string | 最后一条消息预览 |
| content[].messageCount | number | 对话轮数 |
| content[].updatedAt | string | 最后更新时间（ISO 8601 格式） |
| totalElements | number | 总会话数 |
| totalPages | number | 总页数 |

---

### 2. 创建新会话

创建一个新的会话，返回会话信息。

**请求**

```
POST /api/conversations
Content-Type: application/json
```

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 否 | 自定义会话标题，不传则默认为 "New Chat" |

**请求示例**

```json
{
  "title": "口语练习"
}
```

或不传请求体：

```
POST /api/conversations
```

**响应**

| 状态码 | 说明 |
|--------|------|
| 200 | 创建成功 |

**响应数据**

```json
{
  "id": 3,
  "sessionId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "title": "口语练习",
  "lastMessagePreview": null,
  "messageCount": 0,
  "updatedAt": "2024-01-20T11:00:00"
}
```

---

### 3. 删除会话

删除指定会话及其所有聊天记录。

**请求**

```
DELETE /api/conversations/{id}
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 会话数据库ID（注意：不是 sessionId） |

**请求示例**

```
DELETE /api/conversations/1
```

**响应**

| 状态码 | 说明 |
|--------|------|
| 200 | 删除成功 |
| 404 | 会话不存在 |

无响应体。

**注意事项**

- 删除会话会**同时清除**该会话的所有聊天记录和内存缓存
- 此操作不可恢复

---

### 4. 重命名会话

修改会话标题。

**请求**

```
PUT /api/conversations/{id}/title
Content-Type: application/json
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 会话数据库ID |

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 是 | 新的会话标题 |

**请求示例**

```json
{
  "title": "英语语法学习"
}
```

**响应**

| 状态码 | 说明 |
|--------|------|
| 200 | 更新成功 |
| 404 | 会话不存在 |

无响应体。

---

## 前端处理示例 (JavaScript)

### 获取会话列表

```javascript
async function getConversations(page = 0, size = 20) {
  const response = await fetch(`/api/conversations?page=${page}&size=${size}`);

  if (!response.ok) {
    throw new Error('获取会话列表失败');
  }

  return await response.json();
}

// 使用示例
const { content: conversations, totalPages } = await getConversations(0, 10);
console.log('会话列表:', conversations);
```

### 创建新会话并开始聊天

```javascript
async function startNewConversation(title = null) {
  const response = await fetch('/api/conversations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: title ? JSON.stringify({ title }) : null
  });

  if (!response.ok) {
    throw new Error('创建会话失败');
  }

  return await response.json();
}

// 使用示例：创建会话后开始聊天
const conversation = await startNewConversation('口语练习');
// 使用返回的 sessionId 进行聊天
await chatStream(conversation.sessionId, '你好！');
```

### 删除会话

```javascript
async function deleteConversation(id) {
  const response = await fetch(`/api/conversations/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('删除会话失败');
  }
}
```

### 重命名会话

```javascript
async function renameConversation(id, newTitle) {
  const response = await fetch(`/api/conversations/${id}/title`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: newTitle })
  });

  if (!response.ok) {
    throw new Error('重命名失败');
  }
}
```

---

## 使用场景

### 场景1：用户打开应用，显示历史会话列表

```javascript
// 加载会话列表
const { content: conversations } = await getConversations();

// 渲染列表
conversations.forEach(conv => {
  renderConversationItem(conv.id, conv.title, conv.lastMessagePreview, conv.updatedAt);
});
```

### 场景2：用户点击历史会话，继续对话

```javascript
// 用户点击某个会话
function onConversationClick(conversation) {
  // 使用 sessionId 继续聊天
  const { sessionId, title } = conversation;

  // 显示会话标题
  setCurrentConversationTitle(title);

  // 后续聊天使用该 sessionId
  await chatStream(sessionId, '继续我们的对话...');
}
```

### 场景3：用户开始新话题

```javascript
// 用户点击"新建会话"按钮
async function onNewChatClick() {
  const conversation = await startNewConversation();

  // 切换到新会话
  setCurrentSession(conversation.sessionId);
  clearChatHistory(); // 清空界面上的聊天记录
}
```

### 场景4：AI 自动生成标题

用户开始新会话后发送第一条消息时，后端会**自动调用 AI 生成标题**。前端无需处理，只需在下次获取列表或刷新时即可看到更新后的标题。

```javascript
// 创建新会话
const conversation = await startNewConversation(); // title = "New Chat"

// 发送第一条消息
await chatStream(conversation.sessionId, 'I want to practice ordering food at a restaurant');

// 稍后刷新列表，标题可能已更新为 "Restaurant Ordering Practice"
const { content } = await getConversations();
```

---

## 与 Chat API 的关系

| 接口 | 用途 |
|------|------|
| `POST /api/conversations` | 创建会话，获取 sessionId |
| `POST /api/chat/stream` | 使用 sessionId 进行聊天 |
| `DELETE /api/conversations/{id}` | 删除会话（同时清除聊天记录） |
| `DELETE /api/chat/memory/{sessionId}` | 仅清除内存中的上下文，不删除会话 |

**推荐工作流**：

1. 用户开始新聊天 → 调用 `POST /api/conversations` 获取 sessionId
2. 用户发送消息 → 调用 `POST /api/chat/stream` 并传入 sessionId
3. 用户切换话题 → 创建新会话或选择历史会话
4. 用户删除会话 → 调用 `DELETE /api/conversations/{id}`
