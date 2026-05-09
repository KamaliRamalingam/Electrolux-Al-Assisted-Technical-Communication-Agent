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
