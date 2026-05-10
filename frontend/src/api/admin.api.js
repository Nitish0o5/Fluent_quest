import api from './client';

export const adminAPI = {
  getAllUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/users?${query}`).then(r => r.data);
  },
  updateUserRole: (id, data) => api.patch(`/admin/users/${id}/role`, data).then(r => r.data),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/status`).then(r => r.data),
  getSystemHealth: () => api.get('/admin/health').then(r => r.data),
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/audit-logs?${query}`).then(r => r.data);
  },
  bulkUpdateLevels: (data) => api.post('/admin/bulk-update-levels', data).then(r => r.data),
};
