import { getUser } from '@/fetch/users';
import { useUserStore } from '@/types/users';
import { useEffect } from 'react';


export function useCurrentUser() {
  const { user, isLoading, setUser } = useUserStore();

  useEffect(() => {
    // Si l'utilisateur est déjà chargé → on ne rappelle pas l'API
    async function fetchUser() {
      if (user) return;       // déjà chargé → on ne rappelle pas
      const data = await getUser();
      if (data) setUser(data);
    }
    fetchUser();
  }, []); // ← se lance une seule fois au montage

  return { user, isLoading };
}