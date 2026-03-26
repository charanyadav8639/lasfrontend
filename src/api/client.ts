import axios from 'axios';

// The Vite config aliases /api to proxy to the backend at https://lasbackend.onrender.com
// Production builds should set VITE_API_BASE_URL to the actual backend URL (e.g., https://lasbackend.onrender.com/api)
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
