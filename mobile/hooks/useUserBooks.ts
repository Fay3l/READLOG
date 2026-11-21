import { get_userbooks } from "@/fetch/books";
import { useUserBookStore } from "@/types/books";
import { useCallback } from "react";

// Hook synchrone (un hook React ne peut pas être `async`).
// Les livres sont chargés au démarrage par useCurrentUser ;
// `refresh` permet de les recharger à la demande (pull-to-refresh, stats...).
export function useUserBooks() {
    const { userBooks, setUserBooks } = useUserBookStore();

    const refresh = useCallback(async () => {
        const data = await get_userbooks();
        setUserBooks(data);
    }, [setUserBooks]);

    return { userBooks: userBooks ?? [], isLoaded: userBooks !== null, refresh };
}
