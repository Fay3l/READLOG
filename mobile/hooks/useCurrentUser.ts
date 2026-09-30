import { useSession } from '@/auth/ctx';
import { getUser } from '@/fetch/users';
import { GetUser } from '@/types/users';
import { useEffect, useState } from 'react';


export function useCurrentUser() {
  const { session,token, signOut } = useSession();

  const [user, setUser] = useState<GetUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setIsLoading(true);
      console.log(token)
      const data = await getUser();

      if (data) {
        console.log(data)
        setUser(data);
      } else {
        setUser(null);
        signOut();
      }

      setIsLoading(false);
    }

    void fetchUser();
  }, [session]);

  return {
    user,
    isLoading,
  };
}