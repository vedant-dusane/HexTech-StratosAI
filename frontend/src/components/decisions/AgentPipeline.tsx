import { motion } from "framer-motion";
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import { AGENT_DEFS } from "@/types";

function AgentRow({ agent, idx }: { agent: typeof AGENT_DEFS[0]; idx: number }) {
  const state  = useAppStore((s) => s.agentStates[agent.name]);
  const status = state?.status ?? "idle";

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: idx * 0.04 }}
      className={cn(
        "agent-row",
        status === "running" && "border-gold/35 bg-gold/5",
        status === "done"    && "border-emerald/25 bg-emerald/5",
        status === "error"   && "border-rose/25",
      )}
      style={status === "running" ? { borderLeftColor: agent.color, borderLeftWidth: 2 } : {}}
    >
      <span className="text-lg w-6 text-center flex-shrink-0 leading-none">{agent.emoji}</span>

      <div className="flex-1 min-w-0">
        <div
          className="text-sm font-semibold leading-tight transition-colors"
          style={{ color: status !== "idle" ? agent.color : "#8897AE" }}
        >
          {agent.name}
        </div>
        <div className="text-xs text-sub truncate mt-0.5 font-mono">{agent.description}</div>
      </div>

      <div className="flex-shrink-0 flex items-center gap-2">
        {state?.duration_ms > 0 && (
          <span className="text-xs font-mono text-sub">{(state.duration_ms / 1000).toFixed(1)}s</span>
        )}
        {status === "idle"    && <Circle size={13} className="text-sub" />}
        {status === "running" && <Loader2 size={13} className="text-gold animate-spin" />}
        {status === "done"    && <CheckCircle2 size={13} className="text-emerald" />}
        {status === "error"   && <XCircle size={13} className="text-rose" />}
      </div>
    </motion.div>
  );
}

export default function AgentPipeline() {
  const progress  = useAppStore((s) => s.progress);
  const isRunning = useAppStore((s) => s.isRunning);

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="label-xs">Agent Pipeline</span>
        <span className={cn("text-xs font-mono", isRunning ? "text-gold" : "text-sub")}>
          {isRunning ? "running…" : "standby"}
        </span>
      </div>

      <div className="h-[2px] bg-rule">
        <motion.div
          className="h-full bg-gradient-to-r from-gold via-amber to-teal"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="p-3 flex flex-col gap-1.5">
        {AGENT_DEFS.map((ag, i) => (
          <AgentRow key={ag.name} agent={ag} idx={i} />
        ))}
      </div>
    </div>
  );
}
