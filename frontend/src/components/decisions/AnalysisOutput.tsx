import { motion, AnimatePresence } from "framer-motion";
import { Target } from "lucide-react";
import { cn, confidenceColor, extractVerdict, verdictClass } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import { AGENT_DEFS } from "@/types";
import type { Decision } from "@/types";

function ResultCard({ name, output, durationMs }: { name: string; output: string; durationMs: number }) {
  const ag = AGENT_DEFS.find((a) => a.name === name)!;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-rule bg-ridge/40 p-4"
      style={{ borderLeftWidth: 2, borderLeftColor: ag.color }}
    >
      <div className="flex items-center gap-2 mb-2.5">
        <span className="text-sm">{ag.emoji}</span>
        <span className="text-xs font-mono uppercase tracking-wider" style={{ color: ag.color }}>
          {name}
        </span>
        <span className="ml-auto text-xs font-mono text-sub">{(durationMs / 1000).toFixed(1)}s</span>
      </div>
      <p className="text-sm text-dim leading-relaxed whitespace-pre-wrap font-mono">{output}</p>
    </motion.div>
  );
}

function RecommendationBanner({ decision }: { decision: Decision }) {
  const verdict = extractVerdict(decision.recommendation ?? "");
  const conf    = Math.round(decision.confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-gold/25 bg-gradient-to-br from-gold/8 to-transparent p-5 mb-4"
    >
      <div className="flex items-center gap-6">
        <div>
          <div className={cn("font-display text-4xl font-bold leading-none", verdictClass(verdict))}>
            {verdict}
          </div>
          <div className="text-xs font-mono text-dim mt-1.5 uppercase tracking-wider">Recommendation</div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between mb-1.5">
            <span className="text-xs font-mono text-dim">Confidence Score</span>
            <span className={cn("text-sm font-bold font-mono", confidenceColor(decision.confidence))}>{conf}%</span>
          </div>
          <div className="h-2.5 bg-rule rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: conf >= 75 ? "#4ADE80" : conf >= 50 ? "#FBBF24" : "#F87171" }}
              initial={{ width: 0 }}
              animate={{ width: `${conf}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AnalysisOutput({ decision }: { decision: Decision | null }) {
  const agentStates = useAppStore((s) => s.agentStates);
  const isRunning   = useAppStore((s) => s.isRunning);

  const results = AGENT_DEFS.map((ag) => {
    const live      = agentStates[ag.name];
    const persisted = decision?.agent_runs.find((r) => r.agent_name === ag.name);
    return {
      name:   ag.name,
      output: live?.output ?? persisted?.output ?? null,
      durMs:  live?.duration_ms ?? persisted?.duration_ms ?? 0,
    };
  }).filter((r) => r.output);

  if (!decision && results.length === 0) {
    return (
      <div className="panel h-full flex flex-col">
        <div className="panel-head"><span className="label-xs">Analysis Output</span></div>
        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 gap-4">
          <div className="w-16 h-16 rounded-2xl border border-rule bg-ridge/40 grid place-items-center">
            <Target size={28} className="text-sub" />
          </div>
          <div>
            <div className="font-display text-xl text-dim mb-1">No active analysis</div>
            <p className="text-sm text-sub max-w-xs">Submit a decision brief from the New Decision tab to watch all 6 agents work in real time.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panel flex flex-col h-full">
      <div className="panel-head">
        <span className="label-xs">Analysis Output</span>
        {decision && <span className="text-xs font-mono text-sub">#{decision.id.slice(0, 8)}</span>}
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {decision?.status === "complete" && decision.recommendation && (
          <RecommendationBanner decision={decision} />
        )}
        <AnimatePresence>
          {results.map((r) => (
            <ResultCard key={r.name} name={r.name} output={r.output!} durationMs={r.durMs} />
          ))}
        </AnimatePresence>
        {isRunning && results.length === 0 && (
          <div className="text-sm text-sub font-mono italic pt-4">Initializing agents…</div>
        )}
      </div>
    </div>
  );
}
