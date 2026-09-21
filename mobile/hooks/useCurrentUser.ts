import { useSession } from '@/auth/ctx';
import { getUser } from '@/fetch/users';
import { GetUser, useUserStore } from '@/types/users';
import { useEffect, useState } from 'react';


export function useCurrentUser() {
  const { session, signOut } = useSession();

  const [user, setUser] = useState<GetUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setIsLoading(true);

      const data = await getUser();

      if (data) {
        setUser(data);
      } else {
        setUser(null);

        if (session) {
          signOut();
        }
      }

      setIsLoading(false);
    }

    if (session) {
      fetchUser();
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [session]);

  return {
    user,
    isLoading,
  };
}