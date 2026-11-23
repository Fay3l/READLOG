import api from "@/lib/api";
import { GetUser } from "@/types/users";

export async function getUser(): Promise<GetUser | null> {
  try {
    // le jeton est ajouté automatiquement par l'intercepteur de lib/api.ts
    const res = await api.get<GetUser>('/users/me');
    return res.data;
  } catch {
    // 401 (jeton expiré) : géré par l'intercepteur de auth/ctx.tsx
    return null;
  }
}
