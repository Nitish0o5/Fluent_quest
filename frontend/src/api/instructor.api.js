import api from './client';

export const instructorAPI = {
  createCourse: (data) => api.post('/instructor/courses', data).then(r => r.data),
  getCourses: () => api.get('/instructor/courses').then(r => r.data),
  getCourse: (id) => api.get(`/instructor/courses/${id}`).then(r => r.data),
  updateCourse: (id, data) => api.patch(`/instructor/courses/${id}`, data).then(r => r.data),
  addLesson: (courseId, data) => api.post(`/instructor/courses/${courseId}/lessons`, data).then(r => r.data),
  removeLesson: (courseId, data) => api.delete(`/instructor/courses/${courseId}/lessons`, { data }).then(r => r.data),
  enrollStudent: (courseId, data) => api.post(`/instructor/courses/${courseId}/enroll`, data).then(r => r.data),
  getAnalytics: () => api.get('/instructor/analytics').then(r => r.data),
  getAtRiskStudents: () => api.get('/instructor/at-risk').then(r => r.data),
};
