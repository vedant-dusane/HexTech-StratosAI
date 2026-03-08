import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";
import type { DecisionStatus, UrgencyLevel } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(date: string): string {
  // SQLite returns UTC timestamps without 'Z' — append it so JS parses as UTC, not local time
  const utc = date.endsWith("Z") || date.includes("+") ? date : date + "Z";
  return formatDistanceToNow(new Date(utc), { addSuffix: true });
}

export function statusDot(s: DecisionStatus): string {
  return {
    pending:   "bg-sub",
    queued:    "bg-amber",
    analyzing: "bg-gold animate-pulse-dot",
    complete:  "bg-emerald",
    failed:    "bg-rose",
  }[s] ?? "bg-sub";
}

export function statusLabel(s: DecisionStatus): string {
  return {
    pending:   "text-sub",
    queued:    "text-amber",
    analyzing: "text-gold",
    complete:  "text-emerald",
    failed:    "text-rose",
  }[s] ?? "text-sub";
}

export function urgencyBadge(u: UrgencyLevel): string {
  return {
    low:    "bg-sub/20 text-dim",
    medium: "bg-amber/15 text-amber",
    high:   "bg-rose/15 text-rose",
  }[u];
}

export function confidenceColor(c: number): string {
  if (c >= 0.75) return "text-emerald";
  if (c >= 0.5)  return "text-amber";
  return "text-rose";
}

export function extractVerdict(text: string): string {
  const m = text.match(/VERDICT:\s*(PROCEED|DELAY|DECLINE)/i);
  return m ? m[1].toUpperCase() : "—";
}

export function verdictClass(v: string): string {
  if (v === "PROCEED") return "verdict-proceed";
  if (v === "DELAY")   return "verdict-delay";
  return "verdict-decline";
}