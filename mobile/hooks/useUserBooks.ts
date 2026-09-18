import { get_books } from "@/fetch/books";
import { useUserBookStore } from "@/types/books";
import { useEffect } from "react";

export function useUserBook() {
    const { userBooks, setUserBooks } = useUserBookStore();
    useEffect(() => {
        async function fetchUserBooks() {
            if (userBooks) return;
            const data = await get_books();
            if (data) setUserBooks(data);
        }
        fetchUserBooks()
    }, [])
    return { userBooks };
}