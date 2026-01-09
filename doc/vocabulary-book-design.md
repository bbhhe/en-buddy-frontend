# 语境单词本 (Contextual Vocabulary Book) 开发设计文档

## 1. 功能概述 (Overview)

“语境单词本”是 En-Buddy 的一项核心功能，旨在帮助英语学习者将对话中遇到的生词保存下来，并结合**强语境**（当时的对话场景、原句）进行高效复习。与传统单词书不同，本功能强调“在句子中记忆”和“在场景中回忆”。

### 核心价值
- **自动捕获**：在 AI 分析对话时自动提取生词、释义及原句。
- **语境强化**：复习时优先展示“场景”和“完形填空”，强制用户在大脑中构建语境。
- **沉浸体验**：UI 风格模拟精致的实体单词卡，提供舒适的复习体验。

## 2. 系统架构 (Architecture)

本功能主要由前端驱动展示与交互，后端负责数据持久化。目前前端采用了 **Mock/API 混合模式**，在后端接口就绪前通过 `ENABLE_MOCK` 开关进行开发和演示。

### 模块划分
- **数据层 (API Layer)**: `src/api/vocabulary.js` - 封装了卡片的增删改查及 AI 生成请求。
- **业务逻辑层 (Hooks/Utils)**: 复用现有的 `useChat` 和新的 API 函数。
- **UI 展示层 (Features)**:
  - `VocabularyPage`: 单词本主页，负责列表展示和复习模式切换。
  - `FlashCard`: 核心复习组件，实现正反面翻转交互。
  - `PlaygroundPage`: 集成入口，负责触发“生成卡片”的动作。

## 3. 数据模型 (Data Models)

### 单词卡片 (Vocabulary Card)

```typescript
interface VocabularyCard {
  id: string | number;        // 唯一标识
  word: string;               // 核心单词/短语 (e.g., "get to")
  meaning: string;            // 中文释义 (e.g., "到达")
  contextScene: string;       // 语境场景描述 (e.g., "询问如何到达某个地点时使用")
  originalSentence: string;   // 包含该词的原句 (e.g., "How do I get to the station?")
  tip?: string;               // AI 提供的助记/用法贴士
  status: 'new' | 'remembered' | 'mastered'; // 记忆状态
  createdAt: number;          // 创建时间戳
}
```

## 4. 接口设计 (API Contract)

前端期望后端提供以下 RESTful 接口支持：

### 4.1. 分析并保存 (`POST /api/coach/analyze-cards`)
*   **用途**: 根据聊天记录生成单词卡并存入数据库。
*   **请求**: `{ sessionId: string, chatHistory: string }`
*   **响应**: `{ cards: VocabularyCard[], savedCount: number }`

### 4.2. 获取列表 (`GET /api/vocabulary`)
*   **用途**: 获取当前用户的所有单词卡。
*   **响应**: `VocabularyCard[]`

### 4.3. 更新状态 (`PUT /api/vocabulary/:id/status`)
*   **用途**: 更新卡片的记忆状态（如从 `new` 变为 `remembered`）。
*   **请求**: `{ status: string }`
*   **响应**: `VocabularyCard` (更新后的对象)

## 5. UI/UX 设计

### 设计系统 (Design System)
遵循 `Theme: Warm Study Room` 设计主题：
- **核心色板**:
  - Forest Green (主色): `var(--forest-600)`
  - Cream/Paper (背景): `var(--cream-100)`, `var(--cream-50)`
  - Coral (强调): `var(--coral-500)`
- **字体**: 标题使用 Serif (`Crimson Pro`)，正文使用 Sans-Serif (`DM Sans`)。
- **质感**: 使用磨砂玻璃 (`backdrop-blur`) 和柔和阴影 (`shadow-lg`) 营造高级感。

### 关键组件

#### 1. 单词本主页 (`VocabularyPage`)
- **列表模式**: 卡片式列表，左侧展示单词和含义，右侧展示状态标签。
- **复习入口**: 顶部醒目的 Dashboard 卡片，提示待复习数量，提供 "Start Flashcards" 按钮。

#### 2. 抽认卡 (`FlashCard`)
- **3D 翻转**: 使用 CSS `preserve-3d` 和 `rotate-y-180` 实现流畅的翻牌动画。
- **正面 (Challenge)**:
  - 核心：**隐藏**目标单词（Cloze Test），显示 `______`。
  - 辅助：显示 `contextScene`，引导用户联想。
- **背面 (Answer)**:
  - 展示完整信息：单词、音标（如有）、释义、完整原句、贴士。
  - 交互反馈：底部提供 "Forgot" (红色系) 和 "Got it!" (绿色系) 按钮。

## 6. 实现细节与流程

1.  **生成流程**:
    用户在 Playground 点击 "Generate Word Cards" -> 前端调用 `analyzeAndSaveCards` -> 后端 LLM 分析并入库 -> 前端收到成功响应 -> 提示用户。

2.  **复习流程**:
    进入单词本 -> 过滤出 `status !== 'mastered'` 的卡片 -> 存入 `reviewQueue` -> 逐张展示 `FlashCard` -> 用户反馈 -> 调用 `updateCardStatus` -> 切下一张 -> 队列结束，刷新列表。

3.  **Mock 机制**:
    `src/api/vocabulary.js` 内置 `ENABLE_MOCK` 常量。开启时，所有 API 请求会被拦截并返回预设的模拟数据（带有 500-1500ms 延迟以模拟网络），允许在无后端环境下完整演示 UI 流程。
