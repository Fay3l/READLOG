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


export { API_URL };
export default api;