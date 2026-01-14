import api from './index';

/**
 * 翻译文本 - AI 自动检测语言并翻译
 * @param {string} text - 待翻译的文本
 * @returns {Promise<{translatedText: string, sourceLanguage: string, targetLanguage: string}>}
 */
export const translateText = async (text) => {
    const response = await api.post('/translation/translate', { text });
    return response.data;
};
