/**
 * Global Zustand store — agent pipeline state, live log, active decision.
 */
import { create } from "zustand";
import type { AgentStatus } from "@/types";

interface AgentState {
  status: AgentStatus;
  output: string | null;
  duration_ms: number;
}

interface LogEntry {
  ts: string;
  msg: string;
  level: "info" | "success" | "warn";
}

interface AppState {
  activeDecisionId: string | null;
  setActiveDecision: (id: string | null) => void;

  agentStates: Record<string, AgentState>;
  setAgentState: (name: string, s: Partial<AgentState>) => void;
  resetPipeline: () => void;

  progress: number;
  setProgress: (p: number) => void;

  logs: LogEntry[];
  addLog: (msg: string, level?: LogEntry["level"]) => void;
  clearLogs: () => void;

  isRunning: boolean;
  setRunning: (v: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeDecisionId: null,
  setActiveDecision: (id) => set({ activeDecisionId: id }),

  agentStates: {},
  setAgentState: (name, s) =>
    set((prev) => ({ agentStates: { ...prev.agentStates, [name]: { ...prev.agentStates[name], ...s } } })),
  resetPipeline: () => set({ agentStates: {}, progress: 0, logs: [] }),

  progress: 0,
  setProgress: (p) => set({ progress: p }),

  logs: [],
  addLog: (msg, level = "info") =>
    set((prev) => ({
      logs: [
        ...prev.logs.slice(-79),
        { ts: new Date().toLocaleTimeString("en-GB", { hour12: false }), msg, level },
      ],
    })),
  clearLogs: () => set({ logs: [] }),

  isRunning: false,
  setRunning: (v) => set({ isRunning: v }),
}));
