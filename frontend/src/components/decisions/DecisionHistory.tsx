import { Trash2 } from "lucide-react";
import { cn, statusDot, statusLabel, timeAgo, urgencyBadge } from "@/lib/utils";
import { useDecisions, useDeleteDecision } from "@/hooks/useDecisions";
import { useAppStore } from "@/stores/useAppStore";
import toast from "react-hot-toast";
import type { DecisionSummary } from "@/types";

function Row({ d, active, onSelect }: { d: DecisionSummary; active: boolean; onSelect: () => void }) {
  const del = useDeleteDecision();

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Delete this decision and all its analysis data?")) return;
    await del.mutateAsync(d.id);
    toast.success("Deleted");
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 px-3.5 py-3 rounded-xl border cursor-pointer transition-all",
        active ? "border-gold/40 bg-gold/6" : "border-rule bg-ridge/30 hover:border-gold/20 hover:bg-gold/3"
      )}
    >
      <span className={cn("w-2 h-2 rounded-full flex-shrink-0 mt-1.5", statusDot(d.status))} />
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-text truncate">{d.title}</div>
        <div className={cn("text-xs font-mono mt-0.5", statusLabel(d.status))}>
          {d.status} · {timeAgo(d.created_at)}
          {d.confidence > 0 && ` · ${Math.round(d.confidence * 100)}%`}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", urgencyBadge(d.urgency))}>{d.urgency}</span>
        <button onClick={handleDelete} className="text-sub hover:text-rose transition-colors p-0.5">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

export default function DecisionHistory() {
  const { data, isLoading } = useDecisions();
  const activeId  = useAppStore((s) => s.activeDecisionId);
  const setActive = useAppStore((s) => s.setActiveDecision);

  if (isLoading) return <div className="panel p-6 text-sub text-sm">Loading…</div>;
  const items = data?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="panel">
        <div className="panel-head"><span className="label-xs">Decision Archive</span></div>
        <div className="p-10 text-center text-sub text-sm">
          <div className="text-3xl mb-3 opacity-40">📭</div>
          No decisions yet.
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-head">
        <span className="label-xs">Decision Archive</span>
        <span className="text-xs font-mono text-sub">{data?.total}</span>
      </div>
      <div className="p-3 flex flex-col gap-1.5 max-h-[600px] overflow-y-auto">
        {items.map((d) => (
          <Row key={d.id} d={d} active={d.id === activeId} onSelect={() => setActive(d.id)} />
        ))}
      </div>
    </div>
  );
}
