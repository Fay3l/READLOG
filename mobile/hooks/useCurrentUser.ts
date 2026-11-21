import { useSession } from '@/auth/ctx';
import { getUser } from '@/fetch/users';
import { get_userbooks } from '@/fetch/books';
import { useUserBookStore } from '@/types/books';
import { useUserStore } from '@/types/users';
import { useEffect } from 'react';


export function useCurrentUser() {
  const { session, signOut } = useSession();

  const { user, setUser, isLoading, setLoading } = useUserStore();
  const setUserBooks = useUserBookStore((s) => s.setUserBooks);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      setLoading(true);
      const data = await getUser();

      if (cancelled) return; // évite de mettre à jour un composant démonté

      if (data) {
        setUser(data);
        // ✅ au redémarrage de l'app, logIn() n'est pas rappelé :
        // il faut donc charger la bibliothèque ici aussi
        const books = await get_userbooks();
        if (cancelled) return;
        setUserBooks(books);
      } else if (session) {
        // ✅ ne déclenche signOut que si on pensait être connecté
        setUser(null);
        setUserBooks(null);
        signOut();
      }

      setLoading(false);
    }

    if (session) {
      void fetchUser();
    } else {
      setUser(null);
      setUserBooks(null);
      setLoading(false);
    }

    return () => { cancelled = true; };
  }, [session]);

  return {
    user,
    isLoading,
  };
}