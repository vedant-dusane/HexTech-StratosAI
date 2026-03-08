/**
 * React Query hooks — type-safe, cached, auto-refetching data access.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { DecisionCreate } from "@/types";

export const keys = {
  all:    ["decisions"] as const,
  list:   (p: number) => ["decisions", "list", p] as const,
  detail: (id: string) => ["decisions", id] as const,
  stats:  ["decisions", "stats"] as const,
};

export function useDecisions(page = 1) {
  return useQuery({
    queryKey: keys.list(page),
    queryFn:  () => api.decisions.list(page),
    staleTime: 15_000,
  });
}

export function useDecision(id: string | null) {
  return useQuery({
    queryKey: keys.detail(id ?? ""),
    queryFn:  () => api.decisions.get(id!),
    enabled:  !!id,
    staleTime: 5_000,
  });
}

export function useStats() {
  return useQuery({
    queryKey: keys.stats,
    queryFn:  api.decisions.stats,
    refetchInterval: 10_000,
  });
}

export function useCreateDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: DecisionCreate) => api.decisions.create(p),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}

export function useDeleteDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.decisions.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.all }),
  });
}
