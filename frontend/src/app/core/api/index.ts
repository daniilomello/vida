import { useAuthStore } from "@/app/auth/store";

export async function handleApiResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    useAuthStore.getState().logout();
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error?.message ?? `Request failed (${res.status})`);
  }

  return res.json();
}
