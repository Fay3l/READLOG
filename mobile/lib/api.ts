// lib/api.ts — intercepteur qui lit le token depuis SecureStore

import axios from 'axios';
import { router } from 'expo-router';
import { getStorageItemAsync } from '@/auth/useStorageState';

// Surcharge possible sans toucher au code : EXPO_PUBLIC_API_URL=http://... npx expo start
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.155:8000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(async (config) => {
  const token = await getStorageItemAsync('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export { API_URL };
export default api;