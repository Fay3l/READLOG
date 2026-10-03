import { useSession } from '@/auth/ctx';
import { getUser } from '@/fetch/users';
import { useUserStore } from '@/types/users';
import { useEffect } from 'react';


export function useCurrentUser() {
  const { session, signOut } = useSession();

  const { user, setUser, isLoading, setLoading } = useUserStore();

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      setLoading(true);
      const data = await getUser();

      if (cancelled) return; // évite de mettre à jour un composant démonté

      if (data) {
        setUser(data);
      } else if (session) {
        // ✅ ne déclenche signOut que si on pensait être connecté
        setUser(null);
        signOut();
      }

      setLoading(false);
    }

    if (session) {
      void fetchUser();
    } else {
      setUser(null);
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, [session]);

  return {
    user,
    isLoading,
  };
}