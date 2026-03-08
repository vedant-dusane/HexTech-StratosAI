import { Brain, Zap, Activity } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useStats } from "@/hooks/useDecisions";
import { useAppStore } from "@/stores/useAppStore";

const NAV = [
  { to: "/",        label: "Workspace" },
  { to: "/new",     label: "New Decision" },
  { to: "/history", label: "History" },
];

export default function Header() {
  const { pathname } = useLocation();
  const { data: stats } = useStats();
  const isRunning = useAppStore((s) => s.isRunning);

  return (
    <header className="sticky top-0 z-50 h-14 flex items-center px-6 gap-6 border-b border-rule bg-paper/80 backdrop-blur-xl">
      <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-amber/70 grid place-items-center shadow-[0_0_12px_rgba(240,192,96,0.25)]">
          <Brain size={16} className="text-ink" strokeWidth={2.5} />
        </div>
        <span className="font-display text-lg font-bold text-text tracking-tight">
          Stratos<span className="text-gold">AI</span>
        </span>
      </Link>

      <div className="hidden sm:flex items-center px-2 py-0.5 rounded text-[10px] font-mono text-dim border border-rule/60 bg-ridge/30 tracking-widest uppercase">
        HexTech
      </div>

      <nav className="flex items-center gap-1">
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150",
              pathname === n.to
                ? "bg-mist text-text"
                : "text-dim hover:text-text hover:bg-ridge/60"
            )}
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <div className="flex-1" />

      {isRunning && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/8">
          <Zap size={11} className="text-gold animate-pulse-dot" />
          <span className="text-xs font-mono text-gold">analyzing</span>
        </div>
      )}

      {stats && (
        <div className="hidden md:flex items-center gap-5 text-xs font-mono text-dim">
          <span><span className="text-text font-medium">{stats.total_decisions}</span> decisions</span>
          <span><span className="text-gold font-medium">{stats.avg_confidence}%</span> avg conf</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-rule bg-ridge/40">
        <Activity size={10} className="text-emerald" />
        <span className="text-xs font-mono text-dim">live</span>
      </div>
    </header>
  );
}
