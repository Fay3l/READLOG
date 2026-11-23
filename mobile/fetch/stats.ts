import api from "@/lib/api";
import { UserStats } from "@/types/stats";

export async function get_stats(year?: number): Promise<UserStats | null> {
  try {
    const res = await api.get<UserStats>('/users/stats', { params: year ? { year } : undefined })
    return res.data
  } catch {
    return null
  }
}
