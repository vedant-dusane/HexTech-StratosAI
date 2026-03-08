import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/stores/useAppStore";
import DecisionHistory from "@/components/decisions/DecisionHistory";

export default function HistoryPage() {
  const navigate  = useNavigate();
  const setActive = useAppStore((s) => s.setActiveDecision);

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-6">
      <div className="mb-6">
        <p className="label-xs mb-2">Archive</p>
        <h1 className="font-display text-3xl font-bold text-text">Decision History</h1>
        <p className="text-dim mt-2 text-sm">Click any decision to load it in the workspace.</p>
      </div>
      <div className="max-w-xl" onClick={(e) => {
        const id = (e.target as HTMLElement).closest("[data-id]")?.getAttribute("data-id");
        if (id) { setActive(id); navigate("/"); }
      }}>
        <DecisionHistory />
      </div>
    </div>
  );
}
