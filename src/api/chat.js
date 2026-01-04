import api from './index';

export const sendMessage = async (message) => {
  const response = await api.post('/api/chat', { message });
  return response.data;
};
