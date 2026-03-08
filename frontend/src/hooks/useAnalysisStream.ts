/**
 * SSE streaming hook — manages EventSource lifecycle, dispatches to Zustand.
 */
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/stores/useAppStore";
import { keys } from "./useDecisions";

export function useAnalysisStream() {
  const qc = useQueryClient();
  const { setAgentState, setProgress, addLog, setRunning, resetPipeline } = useAppStore();

  const start = useCallback(
    (decisionId: string, onComplete?: () => void) => {
      resetPipeline();
      setRunning(true);
      addLog("🚀 Analysis pipeline started", "info");

      const es = api.stream(decisionId);

      es.onmessage = (e: MessageEvent) => {
        const ev = JSON.parse(e.data) as { type: string; data: Record<string, unknown> };

        if (ev.type === "agent_start") {
          setAgentState(ev.data.agent_name as string, { status: "running", output: null, duration_ms: 0 });
          addLog(`${ev.data.emoji as string} ${ev.data.agent_name as string} started`);
        }

        if (ev.type === "agent_done") {
          const name = ev.data.agent_name as string;
          setAgentState(name, {
            status:      ev.data.error ? "error" : "done",
            output:      ev.data.output as string,
            duration_ms: ev.data.duration_ms as number,
          });
          setProgress((ev.data.progress as number) * 100);
          addLog(`✅ ${name} complete (${ev.data.duration_ms}ms)`, ev.data.error ? "warn" : "success");
          qc.invalidateQueries({ queryKey: keys.detail(decisionId) });
        }

        if (ev.type === "pipeline_complete") {
          setRunning(false);
          setProgress(100);
          addLog("🎯 All agents complete — recommendation ready", "success");
          qc.invalidateQueries({ queryKey: keys.all });
          es.close();
          onComplete?.();
        }

        if (ev.type === "error") {
          setRunning(false);
          addLog(`❌ ${ev.data.message as string}`, "warn");
          es.close();
        }
      };

      es.onerror = () => {
        setRunning(false);
        addLog("⚠ Stream connection lost", "warn");
        es.close();
      };

      return () => es.close();
    },
    [setAgentState, setProgress, addLog, setRunning, resetPipeline, qc]
  );

  return { start };
}
