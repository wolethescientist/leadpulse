"use client";

import Link from "next/link";
import type { Plan } from "@/lib/plan-limits";

const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  solo: "Solo",
  pro: "Pro",
  agency: "Agency",
};

interface UpgradeModalProps {
  currentPlan: Plan;
  featureName: string;
  onClose: () => void;
}

export function UpgradeModal({
  currentPlan,
  featureName,
  onClose,
}: UpgradeModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#13131a] border border-[#2a2a3e] rounded-2xl p-6 w-full max-w-sm mx-4 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
            <LockIcon />
          </div>
          <button
            onClick={onClose}
            className="text-[#4a4a5e] hover:text-white transition"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Copy */}
        <div>
          <h3 className="text-base font-semibold text-white">
            {featureName} requires Pro
          </h3>
          <p className="text-sm text-[#6b6b7e] mt-1.5">
            You&apos;re on the{" "}
            <span className="text-white font-medium">
              {PLAN_LABELS[currentPlan]}
            </span>{" "}
            plan. Upgrade to Pro to unlock AI-generated reply drafts tailored to
            each lead.
          </p>
        </div>

        {/* Feature list */}
        <ul className="space-y-2">
          {[
            "AI reply drafts for every lead",
            "Instant email alerts",
            "Unlimited keywords & leads",
          ].map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-[#8b8b9e]">
              <CheckIcon />
              {f}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className="flex gap-2">
          <Link
            href="/billing"
            className="flex-1 text-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition"
            onClick={onClose}
          >
            Upgrade to Pro
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-[#2a2a3e] rounded-xl text-sm text-[#6b6b7e] hover:text-white transition"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-indigo-400">
      <rect x="3" y="8" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 8V5.5a3 3 0 016 0V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-indigo-400 shrink-0">
      <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
