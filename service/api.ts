import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://aurora-api-095s.onrender.com',
   withCredentials: true,
});
