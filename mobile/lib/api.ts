// lib/api.ts — intercepteur qui lit le token depuis SecureStore
import axios from 'axios';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({ baseURL: 'http://192.168.1.155:8000' });

api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    else { router.push('/login') }
    return config;
});

// Gère le 401 — token expiré → déconnexion automatique
api.interceptors.response.use(
    (res) => res,
    async (err) => {
        if (err.response?.status === 401 || err.response?.status === 404) {
            await SecureStore.deleteItemAsync('session')
            await SecureStore.deleteItemAsync('token');
            router.replace('/login');
        }
        return Promise.reject(err);
    }
);

export default api;