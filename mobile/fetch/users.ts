import api from "@/lib/api";
import { GetUser } from "@/types/users";
import { HttpStatusCode } from "axios";
import { router } from "expo-router";
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env['API_URL'] || "http://192.168.1.155:8000/users"


export async function getUser(): Promise<GetUser | null> {
  try {
    // ✅ l'intercepteur injecte le token automatiquement
    const res = await api.get('/users/me');
    return res.data;
  } catch (err: any) {
    console.log('STATUS :', err.response?.status);
    console.log('DETAIL :', err.response?.data);
    await SecureStore.deleteItemAsync('token')
    await SecureStore.deleteItemAsync('session')
    router.push('/login')
    return null;
    // ✅ le 401 est géré par l'intercepteur — pas besoin de le traiter ici
  }
}