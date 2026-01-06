import { NEWS_API_BASE_URL, NEWS_API_KEY } from '../config/newsApi';

const buildUrl = (path, params = {}) => {
  const url = new URL(`${NEWS_API_BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.append(key, String(value));
    }
  });
  return url.toString();
};

const request = async (path, params) => {
  if (!NEWS_API_KEY || NEWS_API_KEY === 'YOUR_NEWS_API_KEY') {
    throw new Error('Missing News API key.');
  }
  const url = buildUrl(path, { ...params, apiKey: NEWS_API_KEY });
  const response = await fetch(url);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to fetch news.');
  }
  return response.json();
};

export const fetchTopHeadlines = ({ country = 'us', category, page = 1, pageSize = 12 }) => {
  return request('/top-headlines', { country, category, page, pageSize });
};

export const fetchEverything = ({ query, page = 1, pageSize = 12 }) => {
  return request('/everything', { q: query, sortBy: 'publishedAt', language: 'en', page, pageSize });
};
