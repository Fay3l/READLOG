import { BookResult } from "@/types/books";
import axios from "axios"


const API_URL = process.env['API_URL'] || "http://192.168.1.155:8000/books"

export async function search_books(
  search: string
): Promise<BookResult[] | null> {
  try {
    const response = await axios.get<BookResult[]>(
      API_URL + "/search",
      {
        params: {
          q: search,
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}