import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// ── Phase 1 UI functions ────────────────────────────────────────────

/**
 * Transform a raw message into a structured 4-section AI output.
 * @returns {{ success, transformedMessage: { what_is_happening, what_it_means_for_you, what_you_need_to_do, help } }}
 */
export const transformMessage = async (rawMessage, audience, channel, tone, language) => {
  const response = await api.post('/transform', {
    rawMessage,
    audience,
    channel,
    tone:     tone     || 'Reassuring',
    language: language || 'en',
  });
  return response.data;
};

/**
 * Publish an approved transformed message to a channel.
 * @returns {{ success, channel, audience, publishedAt }}
 */
export const publishMessage = async (transformedMessage, channel, audience, scheduledAt) => {
  const response = await api.post('/publish', { transformedMessage, channel, audience, scheduledAt });
  return response.data;
};

/**
 * Publish a transformed message to a Microsoft Teams channel via Incoming Webhook.
 * @param {object}  transformedMessage - The 4-section message object
 * @param {string}  channel            - Display name (default 'Microsoft Teams')
 * @param {string}  audience           - Audience key
 * @param {string}  [scheduledAt]      - ISO timestamp for scheduled publish
 * @param {string}  webhookUrl         - Teams Incoming Webhook URL
 * @returns {{ success, channel, audience, publishedAt }}
 */
export const publishToTeams = async (transformedMessage, channel, audience, scheduledAt, webhookUrl) => {
  const response = await api.post('/teams/publish', {
    transformedMessage,
    channel,
    audience,
    scheduledAt,
    webhookUrl,
  });
  return response.data;
};

// ── Legacy / other endpoints ────────────────────────────────────────

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
