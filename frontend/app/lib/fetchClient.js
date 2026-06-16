import api from './axios';

export default async function fetchClient(endpoint, options = {}) {
  const { method = 'GET', data, headers } = options;
  try {
    const res = await api({
      url: endpoint,
      method,
      data,
      headers,
    });
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.response?.data?.error || err.message || 'An error occurred';
    throw new Error(message);
  }
}
