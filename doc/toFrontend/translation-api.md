# Translation API 接口文档

## 概述

翻译接口提供中英互译功能，AI 自动检测输入语言并翻译为目标语言。

## 接口

### 翻译文本

**请求**

```
POST /api/translation/translate
Content-Type: application/json
```

**请求参数**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| text | string | 是 | 待翻译的文本内容 |

**请求示例**

```json
{
    "text": "Hello, how are you?"
}
```

**响应参数**

| 字段 | 类型 | 说明 |
|------|------|------|
| translatedText | string | 翻译后的文本 |
| sourceLanguage | string | 源语言代码 (en/zh) |
| targetLanguage | string | 目标语言代码 (en/zh) |

**响应示例**

英文翻译为中文：
```json
{
    "translatedText": "你好，你怎么样？",
    "sourceLanguage": "en",
    "targetLanguage": "zh"
}
```

中文翻译为英文：
```json
{
    "translatedText": "Hello, how are you?",
    "sourceLanguage": "zh",
    "targetLanguage": "en"
}
```

**错误响应**

当请求文本为空时，返回 400 Bad Request：
```json
{
    "status": 400,
    "error": "Bad Request",
    "message": "翻译文本不能为空"
}
```

---

## 使用示例

### JavaScript

```javascript
async function translate(text) {
    const response = await fetch('/api/translation/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
    });

    return await response.json();
}

// 英文翻译为中文
const result1 = await translate("Hello, world!");
console.log(result1.translatedText); // "你好，世界！"

// 中文翻译为英文
const result2 = await translate("你好，世界！");
console.log(result2.translatedText); // "Hello, world!"
```

### cURL

```bash
# 英文翻译为中文
curl -X POST http://localhost:8080/api/translation/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, world!"}'

# 中文翻译为英文
curl -X POST http://localhost:8080/api/translation/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "你好，世界！"}'
```
