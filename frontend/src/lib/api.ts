/**
 * Typed Axios API client — all HTTP calls live here.
 * Uses interceptors for uniform error handling.
 */
import axios, { AxiosError } from "axios";
import type { Decision, DecisionCreate, DecisionListResponse, Stats } from "@/types";

const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : "/api/v1";

export const apiClient = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

apiClient.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ detail?: string }>) => {
    const msg = err.response?.data?.detail ?? err.message ?? "Unknown error";
    return Promise.reject(new Error(msg));
  }
);

export const api = {
  decisions: {
    list: (page = 1, pageSize = 20) =>
      apiClient.get<DecisionListResponse>("/decisions", { params: { page, page_size: pageSize } }).then(r => r.data),
    get: (id: string) =>
      apiClient.get<Decision>(`/decisions/${id}`).then(r => r.data),
    create: (payload: DecisionCreate) =>
      apiClient.post<Decision>("/decisions", payload).then(r => r.data),
    delete: (id: string) =>
      apiClient.delete(`/decisions/${id}`),
    stats: () =>
      apiClient.get<Stats>("/decisions/stats").then(r => r.data),
  },
  /** Open an SSE stream for live agent analysis.
   * Connects directly to backend (bypasses Vite proxy which buffers SSE).
   */
  stream: (decisionId: string): EventSource => {
    const direct = import.meta.env.VITE_API_URL
      ? `${import.meta.env.VITE_API_URL}/api/v1`
      : "http://localhost:8000/api/v1";
    return new EventSource(`${direct}/decisions/${decisionId}/analyze`);
  },
};