import StatsBar from "@/components/dashboard/StatsBar";
import AgentPipeline from "@/components/decisions/AgentPipeline";
import AnalysisOutput from "@/components/decisions/AnalysisOutput";
import ActivityLog from "@/components/decisions/ActivityLog";
import DecisionHistory from "@/components/decisions/DecisionHistory";
import { useAppStore } from "@/stores/useAppStore";
import { useDecision } from "@/hooks/useDecisions";
import { useAnalysisStream } from "@/hooks/useAnalysisStream";
import { RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

export default function WorkspacePage() {
  const activeId  = useAppStore((s) => s.activeDecisionId);
  const isRunning = useAppStore((s) => s.isRunning);
  const { start } = useAnalysisStream();
  const { data: decision } = useDecision(activeId);

  function rerun() {
    if (!activeId) return;
    start(activeId, () => toast.success("Re-analysis complete! 🎯"));
  }

  return (
    <div className="max-w-screen-2xl mx-auto px-6 py-6">
      <div className="mb-7">
        <p className="label-xs mb-2">Business Intelligence · Multi-Agent AI</p>
        <h1 className="font-display text-3xl md:text-4xl text-text font-bold leading-tight">
          Turn complex decisions into{" "}
          <em className="text-gold not-italic italic">clear verdicts</em>
        </h1>
      </div>

      <StatsBar />

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_260px] gap-5 items-start">
        {/* Left: pipeline + log */}
        <div className="flex flex-col gap-4">
          <AgentPipeline />
          <ActivityLog />
        </div>

        {/* Center: output */}
        <div className="flex flex-col gap-3 min-h-[600px]">
          {activeId && decision?.status === "complete" && !isRunning && (
            <div className="flex justify-end">
              <button onClick={rerun} className="btn-ghost flex items-center gap-1.5">
                <RefreshCw size={11} /> Re-run
              </button>
            </div>
          )}
          <div className="flex-1">
            <AnalysisOutput decision={decision ?? null} />
          </div>
        </div>

        {/* Right: history */}
        <DecisionHistory />
      </div>
    </div>
  );
}
