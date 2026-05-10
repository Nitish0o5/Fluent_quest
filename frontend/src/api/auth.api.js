import api, { setAccessToken } from './client';

export const authAPI = {
  register: async (data) => {
    const res = await api.post('/auth/register', data);
    setAccessToken(res.data.data.accessToken);
    return res.data;
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setAccessToken(res.data.data.accessToken);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  refresh: async () => {
    const res = await api.post('/auth/refresh');
    setAccessToken(res.data.data.accessToken);
    return res.data;
  },

  logout: async () => {
    await api.post('/auth/logout');
    setAccessToken(null);
  },
};
