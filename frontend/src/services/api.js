import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export const simplifyText = async (text, audience, language, tone) => {
  const response = await api.post('/simplify', { text, audience, language, tone });
  return response.data;
};

export const publishToSlack = async (message) => {
  const response = await api.post('/slack/publish', { message });
  return response.data;
};

export const fetchMessages = async () => {
  const response = await api.get('/messages');
  return response.data;
};

export const fetchTemplates = async () => {
  const response = await api.get('/templates');
  return response.data;
};

export const fetchApprovals = async () => {
  const response = await api.get('/approvals');
  return response.data;
};

export const approveMessage = async (id) => {
  const response = await api.post(`/approvals/${id}/approve`);
  return response.data;
};

export const fetchAnalytics = async () => {
  const response = await api.get('/analytics');
  return response.data;
};

export const fetchSettings = async () => {
  const response = await api.get('/settings');
  return response.data;
};
