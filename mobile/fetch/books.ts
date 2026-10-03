import api from "@/lib/api";
import { BookResult, GetBook, useUserBookStore } from "@/types/books";

export async function search_books(
  search: string,
): Promise<BookResult[] | null> {
  try {
    const response = await api.get<BookResult[]>(
      "/books/search",
      {
        params: {
          q: search,
        },
      }
    );
    return response.data;
  } catch {
    return []
  }
}

export async function get_books() {
  const response = await api.get<GetBook[]>('/books/')
  if (!response.data) return []
  return response.data
}

// fetch/books.ts
export async function add_book(book: BookResult) {
  try {
    const res = await api.post(`/books/add?google_books_id=${book.google_books_id}`);

    if (res.status === 200) {
      const data = await get_books();
      if (data) {
        useUserBookStore.getState().setUserBooks(data); // ✅ .getState(), pas le hook
        return true;
      }
      return false;
    }
    return false;
  } catch (err: any) {
    console.log(err.response?.data?.detail);
    return false;
  }
}