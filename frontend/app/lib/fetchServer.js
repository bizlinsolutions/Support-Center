import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function fetchServer(endpoint, options = {}) {
  const { token, method = 'GET', data, headers: extraHeaders = {} } = options;

  const headers = { ...extraHeaders };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (data) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await axios({
      url: `${BASE_URL}${endpoint}`,
      method,
      headers,
      data,
      timeout: 10000,
    });
    return res.data;
  } catch (err) {
    const message = err.response?.data?.message || err.response?.data?.error || err.message || 'An error occurred';
    const error = new Error(message);
    error.status = err.response?.status || 500;
    throw error;
  }
}