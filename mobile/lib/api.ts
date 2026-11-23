// lib/api.ts — client HTTP : ajoute le jeton à chaque requête

import axios from 'axios';
import { getStorageItemAsync } from '@/auth/useStorageState';

// Surcharge possible sans toucher au code : EXPO_PUBLIC_API_URL=http://... npx expo start
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.1.155:8000/api';

// eslint-disable-next-line import/no-named-as-default-member -- axios.create est l'usage documenté
const api = axios.create({ baseURL: API_URL, timeout: 15000 });

api.interceptors.request.use(async (config) => {
  const token = await getStorageItemAsync('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});


export { API_URL };
export default api;