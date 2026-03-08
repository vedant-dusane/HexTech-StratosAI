import { useStats } from "@/hooks/useDecisions";

export default function StatsBar() {
  const { data } = useStats();

  const stats = [
    { label: "Decisions Analyzed", value: data?.total_decisions ?? "—" },
    { label: "Completed",          value: data?.completed       ?? "—" },
    { label: "Avg Confidence",     value: data ? `${data.avg_confidence}%` : "—" },
    { label: "Agent Runs",         value: data?.total_agent_runs ?? "—" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-rule rounded-2xl overflow-hidden border border-rule mb-6">
      {stats.map((s) => (
        <div key={s.label} className="bg-card px-5 py-4 hover:bg-ridge/60 transition-colors">
          <div className="font-display text-3xl font-bold text-gold leading-none">{s.value}</div>
          <div className="text-xs font-mono text-sub mt-2 uppercase tracking-wider">{s.label}</div>
        </div>
      ))}
    </div>
  );
}
