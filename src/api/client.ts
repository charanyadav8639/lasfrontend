import axios from 'axios';

// The Vite config aliases /api to proxy to the backend at http://localhost:8080
export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
