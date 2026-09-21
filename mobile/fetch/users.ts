import { SignOut, useSession } from "@/auth/ctx";
import { useStorageState } from "@/auth/useStorageState";
import api from "@/lib/api";
import { GetUser } from "@/types/users";
import * as SecureStore from 'expo-secure-store';



export async function getUser(): Promise<GetUser | null> {
  try {
    // ✅ l'intercepteur injecte le token automatiquement
    const res = await api.get('/users/me');
    return res.data;
  } catch (err: any) {
    console.log('STATUS :', err.response?.status);
    

    if (err.response?.status === 401) {
      console.log('DETAIL :', err.response?.data);
    }

    return null;
    // ✅ le 401 est géré par l'intercepteur — pas besoin de le traiter ici
  }
}