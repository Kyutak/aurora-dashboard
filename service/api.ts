import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://aurora-api-095s.onrender.com',
   withCredentials: true,
});

api.interceptors.request.use(config => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});