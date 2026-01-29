import axios from 'axios';
import { Session } from 'inspector';

export const api = axios.create({
  baseURL: 'https://aurora-api-095s.onrender.com',
   withCredentials: true,

});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = sessionStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});