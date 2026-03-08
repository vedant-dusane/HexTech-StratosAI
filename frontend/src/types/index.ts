// Complete TypeScript domain types for StratosAI

export type DecisionStatus = "pending" | "queued" | "analyzing" | "complete" | "failed";
export type AgentStatus    = "idle" | "running" | "done" | "error";
export type UrgencyLevel   = "low" | "medium" | "high";

export interface AgentRun {
  id: string;
  decision_id: string;
  agent_name: string;
  agent_type: string;
  status: AgentStatus;
  output: string | null;
  error: string | null;
  duration_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  started_at: string | null;
  completed_at: string | null;
}

export interface Decision {
  id: string;
  title: string;
  context: string;
  domain: string;
  urgency: UrgencyLevel;
  status: DecisionStatus;
  confidence: number;
  recommendation: string | null;
  created_at: string;
  completed_at: string | null;
  agent_runs: AgentRun[];
}

export interface DecisionSummary {
  id: string;
  title: string;
  domain: string;
  urgency: UrgencyLevel;
  status: DecisionStatus;
  confidence: number;
  created_at: string;
  completed_at: string | null;
}

export interface DecisionListResponse {
  items: DecisionSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface DecisionCreate {
  title: string;
  context: string;
  domain: string;
  urgency: UrgencyLevel;
}

export interface Stats {
  total_decisions: number;
  completed: number;
  analyzing: number;
  avg_confidence: number;
  total_agent_runs: number;
  success_rate: number;
}

// SSE event payloads
export interface SSEAgentDoneData {
  agent_name: string;
  emoji: string;
  color: string;
  output: string;
  error: string | null;
  duration_ms: number;
  prompt_tokens: number;
  completion_tokens: number;
  confidence: number;
  index: number;
  progress: number;
}

// Static agent definitions for UI
export interface AgentDef {
  name: string;
  emoji: string;
  color: string;
  description: string;
}

export const AGENT_DEFS: AgentDef[] = [
  { name: "Scout",      emoji: "🔭", color: "#60A5FA", description: "Context extraction & variable mapping" },
  { name: "Devil",      emoji: "😈", color: "#F87171", description: "Risk analysis & stress testing" },
  { name: "Oracle",     emoji: "🔮", color: "#A78BFA", description: "Market intel & precedent matching" },
  { name: "Quant",      emoji: "📐", color: "#4ADE80", description: "Financial modelling & scenario math" },
  { name: "Diplomat",   emoji: "🤝", color: "#FBBF24", description: "Stakeholder mapping & buy-in risk" },
  { name: "Strategist", emoji: "🎯", color: "#38BDF8", description: "Synthesis & final recommendation" },
];

export const DOMAINS = [
  { value: "general",    label: "General Business" },
  { value: "finance",    label: "Finance & Investment" },
  { value: "product",    label: "Product Strategy" },
  { value: "hiring",     label: "Hiring & Talent" },
  { value: "marketing",  label: "Marketing & GTM" },
  { value: "operations", label: "Operations" },
  { value: "technology", label: "Technology & Infra" },
  { value: "m&a",        label: "M&A / Partnerships" },
];

export const EXAMPLE_DECISIONS: DecisionCreate[] = [
  {
    title: "EU Market Expansion Q3",
    domain: "marketing", urgency: "high",
    context: "We are a $12M ARR B2B SaaS company considering expansion into Germany and France in Q3. Budget ceiling: $800K. We have 2 warm enterprise prospects in Germany. Key concerns: GDPR compliance, local sales hire cost, EUR/USD currency exposure, and whether to self-host or partner with a local reseller. Success metric: €500K ARR from EU within 12 months.",
  },
  {
    title: "Series B vs. Profitability Path",
    domain: "finance", urgency: "high",
    context: "We are at $8M ARR growing 15% MoM with 18 months runway. Two paths: (1) Raise Series B ~$20M at $80M valuation to pour into growth, or (2) cut burn 40% and reach profitability in 9 months. Current burn $550K/mo. SaaS multiples are compressing. Team of 45 people. Investors support either path but need a decision in 3 weeks.",
  },
  {
    title: "Promote Internal SDR to VP Sales vs. External Hire",
    domain: "hiring", urgency: "medium",
    context: "Our top SDR (3 years tenure) wants VP Sales. Three strong external candidates also exist. Internal knows culture but lacks enterprise leadership experience. Externals are 60-80% more expensive. We need to 3x ARR in 18 months. Team deeply respects the internal candidate and morale risk of passing them over is real.",
  },
  {
    title: "Acquire Competitor or Build Feature Parity",
    domain: "product", urgency: "medium",
    context: "A direct competitor (50K users, $1.2M ARR, struggling) is available for ~$3M cash. Alternative: build their 3 key differentiating features in ~6 months with our 4-person eng team. Our cash position: $9M. They have 3 critical integrations that would take us 12+ months to rebuild. Their NPS is 61 vs our 48.",
  },
];
