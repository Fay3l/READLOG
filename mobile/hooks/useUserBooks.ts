import { get_userbooks } from "@/fetch/books";
import { useUserBookStore } from "@/types/books";
import { useEffect } from "react";

export async function useUserBook() {
    const { userBooks, setUserBooks } = useUserBookStore();
    if (userBooks) return;
    console.log("--- GETBOOKS ---")
    const data = await get_userbooks();
    console.log("--- GETBOOKS1 ---")
    setUserBooks(data);
    return { userBooks, setUserBooks };
}