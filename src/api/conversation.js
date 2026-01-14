import api from './index';

/**
 * Get conversation list
 * @param {number} page Page number (0-based)
 * @param {number} size Page size
 */
export const getConversations = async (page = 0, size = 20) => {
    const response = await api.get(`/conversations?page=${page}&size=${size}`);
    return response.data;
};

/**
 * Create a new conversation
 * @param {string} title Optional title
 */
export const createConversation = async (title = null) => {
    const response = await api.post('/conversations', title ? { title } : {});
    return response.data;
};

/**
 * Delete a conversation
 * @param {number} id Conversation database ID
 */
export const deleteConversation = async (id) => {
    await api.delete(`/conversations/${id}`);
};

/**
 * Rename a conversation
 * @param {number} id Conversation database ID
 * @param {string} title New title
 */
export const renameConversation = async (id, title) => {
    await api.put(`/conversations/${id}/title`, { title });
};

/**
 * Get messages for a specific conversation
 * @param {number} id Conversation database ID
 */
export const getConversationMessages = async (id) => {
    const response = await api.get(`/conversations/${id}/messages`);
    return response.data;
};
