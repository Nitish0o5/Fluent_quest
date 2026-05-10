import api from './client';

export const studentAPI = {
  getProfile: () => api.get('/student/profile').then(r => r.data),
  onboard: (data) => api.post('/student/onboard', data).then(r => r.data),
  updateProfile: (data) => api.patch('/student/profile', data).then(r => r.data),
  getLeaderboard: (limit = 20) => api.get(`/student/leaderboard?limit=${limit}`).then(r => r.data),
  useStreakFreeze: () => api.post('/student/streak-freeze').then(r => r.data),
};
