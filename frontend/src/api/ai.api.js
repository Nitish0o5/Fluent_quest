import api from './client';

export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data).then(r => r.data),
  grammarCheck: (data) => api.post('/ai/grammar-check', data).then(r => r.data),
  generateContent: (data) => api.post('/ai/generate-content', data).then(r => r.data),
  getConversations: () => api.get('/ai/conversations').then(r => r.data),
  getConversation: (id) => api.get(`/ai/conversations/${id}`).then(r => r.data),
};
