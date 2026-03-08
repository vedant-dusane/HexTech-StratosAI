import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Zap, Lightbulb } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useCreateDecision } from "@/hooks/useDecisions";
import { useAnalysisStream } from "@/hooks/useAnalysisStream";
import { useAppStore } from "@/stores/useAppStore";
import { DOMAINS, EXAMPLE_DECISIONS, type DecisionCreate, type UrgencyLevel } from "@/types";

const URGENCIES: { value: UrgencyLevel; label: string; cls: string }[] = [
  { value: "low",    label: "Low",    cls: "border-sub/40 text-sub data-[active=true]:border-dim data-[active=true]:bg-sub/15 data-[active=true]:text-dim" },
  { value: "medium", label: "Medium", cls: "border-amber/30 text-amber/60 data-[active=true]:border-amber data-[active=true]:bg-amber/12 data-[active=true]:text-amber" },
  { value: "high",   label: "High",   cls: "border-rose/30 text-rose/60 data-[active=true]:border-rose data-[active=true]:bg-rose/12 data-[active=true]:text-rose" },
];

export default function NewDecisionForm() {
  const navigate  = useNavigate();
  const create    = useCreateDecision();
  const { start } = useAnalysisStream();
  const setActive = useAppStore((s) => s.setActiveDecision);
  const isRunning = useAppStore((s) => s.isRunning);

  const [form, setForm] = useState<DecisionCreate>({
    title: "", context: "", domain: "general", urgency: "medium",
  });

  const set = (k: keyof DecisionCreate, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit() {
    if (!form.title.trim() || !form.context.trim()) {
      toast.error("Title and context are required"); return;
    }
    try {
      const decision = await create.mutateAsync(form);
      setActive(decision.id);
      // Start stream before navigating so pipeline state is ready when WorkspacePage mounts
      start(decision.id, () => toast.success("Analysis complete! 🎯"));
      toast.success("Decision created — launching agents…");
      navigate("/");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
      {/* Form */}
      <div className="panel">
        <div className="panel-head"><span className="label-xs">Decision Brief</span></div>
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="label-xs block mb-2">Decision Title</label>
            <input className="input-field" placeholder="e.g. Should we expand to the EU in Q3?" value={form.title} onChange={(e) => set("title", e.target.value)} />
          </div>
          <div>
            <label className="label-xs block mb-2">Full Context & Background</label>
            <textarea
              rows={8} className="input-field resize-none"
              placeholder={"Describe the decision fully:\n• What is being decided and why now\n• Options under consideration\n• Budget, timeline, regulatory constraints\n• Key stakeholders involved\n• What success looks like in 12 months"}
              value={form.context}
              onChange={(e) => set("context", e.target.value)}
            />
            <div className="text-right text-xs font-mono text-sub mt-1">
              {form.context.split(/\s+/).filter(Boolean).length} words
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-xs block mb-2">Domain</label>
              <select className="input-field" value={form.domain} onChange={(e) => set("domain", e.target.value)}>
                {DOMAINS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label-xs block mb-2">Urgency</label>
              <div className="flex gap-2">
                {URGENCIES.map((u) => (
                  <button
                    key={u.value}
                    data-active={form.urgency === u.value}
                    onClick={() => set("urgency", u.value)}
                    className={cn("flex-1 py-2 rounded-xl text-xs font-semibold border transition-all", u.cls)}
                  >
                    {u.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            className="btn-gold w-full justify-center py-3 text-base"
            onClick={handleSubmit}
            disabled={isRunning || create.isPending}
          >
            {(isRunning || create.isPending)
              ? <><Loader2 size={16} className="animate-spin" /> Analyzing…</>
              : <><Zap size={16} /> Analyze Decision</>}
          </button>
        </div>
      </div>

      {/* Examples */}
      <div className="panel">
        <div className="panel-head">
          <span className="label-xs">Example Decisions</span>
          <Lightbulb size={13} className="text-dim" />
        </div>
        <div className="p-3 flex flex-col gap-2">
          {EXAMPLE_DECISIONS.map((ex, i) => (
            <button
              key={i}
              onClick={() => { setForm(ex); toast("Example loaded", { icon: "📋" }); }}
              className="text-left p-3.5 rounded-xl border border-rule bg-ridge/40 hover:border-gold/40 hover:bg-gold/5 transition-all duration-150 group"
            >
              <div className="font-semibold text-sm text-dim group-hover:text-gold transition-colors mb-1">{ex.title}</div>
              <div className="text-xs font-mono text-sub mb-1.5">{ex.domain} · {ex.urgency} urgency</div>
              <p className="text-xs text-sub/70 leading-relaxed line-clamp-2">{ex.context}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
