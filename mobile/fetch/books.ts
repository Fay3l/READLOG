import api from "@/lib/api";
import { BookResult, GetBook } from "@/types/books";



const API_URL = process.env['API_URL'] || "http://192.168.1.155:8000/books"

export async function search_books(
  search: string
): Promise<BookResult[] | null> {
  try {
    const response = await api.get<BookResult[]>(
      API_URL + "/search",
      {
        params: {
          q: search,
        },
      }
    );
    
    return response.data;
  } catch (error) {
    return []
  }
}

export async function get_books() {
  try {
    const response = await api.get<GetBook[]>('/books/')
    return response.data
  }
  catch (error) {
    return []
  }
}