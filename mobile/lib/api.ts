// lib/api.ts — intercepteur qui lit le token depuis SecureStore
import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'http://192.168.1.155:8000';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    console.log('INTERCEPTEUR 401 :', err.response?.status); // ← pour vérifier
    if (err.response?.status === 401) {
      await SecureStore.deleteItemAsync('token');
      await SecureStore.deleteItemAsync('session');
      router.push('/login');
    }
    return Promise.reject(err);
  }
);

export { API_URL };
export default api;