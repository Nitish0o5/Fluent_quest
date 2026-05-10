import api from './client';

export const srsAPI = {
  getDueCards: (language) => {
    const params = language ? `?language=${language}` : '';
    return api.get(`/srs/cards/due${params}`).then(r => r.data);
  },
  getStats: (language) => {
    const params = language ? `?language=${language}` : '';
    return api.get(`/srs/cards/stats${params}`).then(r => r.data);
  },
  createCard: (data) => api.post('/srs/cards', data).then(r => r.data),
  reviewCard: (id, data) => api.post(`/srs/cards/${id}/review`, data).then(r => r.data),
  deleteCard: (id) => api.delete(`/srs/cards/${id}`).then(r => r.data),
  autoGenerate: (lessonId) => api.post(`/srs/cards/generate/${lessonId}`).then(r => r.data),
};
