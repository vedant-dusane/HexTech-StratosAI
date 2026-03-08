import NewDecisionForm from "@/components/decisions/NewDecisionForm";

export default function NewDecisionPage() {
  return (
    <div className="max-w-screen-xl mx-auto px-6 py-6">
      <div className="mb-6">
        <p className="label-xs mb-2">New Decision</p>
        <h1 className="font-display text-3xl font-bold text-text">Submit a Decision Brief</h1>
        <p className="text-dim mt-2 text-sm max-w-xl font-sans">
          The more detail you provide, the sharper the analysis. Include constraints, stakeholders, and success metrics.
        </p>
      </div>
      <NewDecisionForm />
    </div>
  );
}
