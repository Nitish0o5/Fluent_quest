import api from './client';

export const lessonsAPI = {
  getLessons: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/lessons?${query}`).then(r => r.data);
  },
  getLessonById: (id) => api.get(`/lessons/${id}`).then(r => r.data),
  getLevelProgress: (params) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/lessons/progress/level?${query}`).then(r => r.data);
  },
  getProgress: (id) => api.get(`/lessons/${id}/progress`).then(r => r.data),
  startLesson: (id) => api.post(`/lessons/${id}/start`).then(r => r.data),
  submitExercise: (id, data) => api.post(`/lessons/${id}/submit`, data).then(r => r.data),
  completeLesson: (id) => api.post(`/lessons/${id}/complete`).then(r => r.data),

  // Instructor
  getMyLessons: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/lessons/my-lessons?${query}`).then(r => r.data);
  },
  createLesson: (data) => api.post('/lessons', data).then(r => r.data),
  updateLesson: (id, data) => api.patch(`/lessons/${id}`, data).then(r => r.data),
  deleteLesson: (id) => api.delete(`/lessons/${id}`).then(r => r.data),
  publishLesson: (id) => api.patch(`/lessons/${id}/publish`).then(r => r.data),
};
