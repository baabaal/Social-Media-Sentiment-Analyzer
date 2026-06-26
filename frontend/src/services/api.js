import axios from 'axios';

// Saat dev, Vite proxy /api → backend. Saat production, set baseURL ke domain backend
// atau biarkan relatif jika frontend & backend di-serve dari domain yang sama via Nginx.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 300000,         // crawling bisa 1-2 menit
});

export const analyzeUrl = (url) =>
  api.post('/analyze', { url }).then(r => r.data);

export const getAnalysis = (id) =>
  api.get(`/analysis/${id}`).then(r => r.data);

export const getHistory = () =>
  api.get('/history').then(r => r.data);

export const getDownloadUrl = (id, format = 'csv') =>
  `${api.defaults.baseURL}/analysis/${id}/download?format=${format}`;

export default api;
