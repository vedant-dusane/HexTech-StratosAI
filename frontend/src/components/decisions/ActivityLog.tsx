import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";

export default function ActivityLog() {
  const logs = useAppStore((s) => s.logs);
  const ref  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
  }, [logs]);

  return (
    <div className="rounded-2xl border border-rule overflow-hidden">
      <div className="panel-head">
        <span className="label-xs">Activity Log</span>
        <span className="text-xs font-mono text-sub">{logs.length} entries</span>
      </div>
      <div
        ref={ref}
        className="bg-ink h-44 overflow-y-auto p-3 flex flex-col gap-0.5 font-mono text-xs"
      >
        {logs.length === 0 && <span className="text-sub italic">— awaiting analysis…</span>}
        {logs.map((l, i) => (
          <div key={i} className="flex gap-3 animate-fade-in">
            <span className="text-rule flex-shrink-0 select-none">{l.ts}</span>
            <span className={cn(
              l.level === "success" && "text-emerald",
              l.level === "warn"    && "text-amber",
              l.level === "info"    && "text-dim",
            )}>
              {l.msg}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
