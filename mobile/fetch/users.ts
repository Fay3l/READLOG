import api from "@/lib/api";
import { GetUser } from "@/types/users";
import { router } from "expo-router";
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env['API_URL'] || "http://192.168.1.155:8000/users"


export async function getUser(): Promise<GetUser | null> {
    try {
        const raw = await SecureStore.getItemAsync('token')
        const session = await SecureStore.getItemAsync('session')
        const token = raw?.replace(/^"|"$/g, '');
        console.log('TOKEN :', token);
        console.log('SESSION :', session);
        if (!token && session || !token)
        {   
            await SecureStore.deleteItemAsync('session')
            router.replace('/login')
            return null
        }
        const res = await api.get('/users/me');
        return res.data
    } catch (err:any) {
        console.log('Impossible de charger l\'utilisateur', err);
        console.log('STATUS :', err.response?.status);      // ex: 401, 404, 422
        console.log('DETAIL :', err.response?.data);        // message d'erreur FastAPI
        console.log('URL    :', API_URL + '/me');
        return null
    }
}