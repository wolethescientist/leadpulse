"use client";

import { useQuery, useAction } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getKeywordLimit, getLeadLimit, hasInstantAlerts, hasAIReply, hasSlack, hasTeamSeats, type Plan } from "@/lib/plan-limits";
import { useState } from "react";

const PLANS: {
  id: Plan;
  name: string;
  price: number | null;
  priceLabel: string;
  description: string;
  highlights: string[];
}[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "$0",
    description: "Get started, no credit card needed",
    highlights: ["3 keywords", "10 leads/mo", "Daily digest"],
  },
  {
    id: "solo",
    name: "Solo",
    price: 15,
    priceLabel: "$15",
    description: "Perfect for freelancers just picking up speed",
    highlights: ["10 keywords", "50 leads/mo", "Slack alerts", "CSV export"],
  },
  {
    id: "pro",
    name: "Pro",
    price: 35,
    priceLabel: "$35",
    description: "Unlimited leads with AI-powered replies",
    highlights: [
      "Unlimited keywords",
      "Unlimited leads",
      "Instant alerts",
      "AI reply drafts",
      "Slack alerts",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    price: 79,
    priceLabel: "$79",
    description: "Built for agencies managing multiple clients",
    highlights: [
      "Everything in Pro",
      "Team seats",
      "Priority support",
      "White-label exports",
    ],
  },
];

export default function BillingPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  const status = useQuery(
    api.billing.getSubscriptionStatus,
    isAuthenticated ? {} : "skip"
  );

  const createCheckout = useAction(api.billing.createCheckoutSession);
  const [loadingPlan, setLoadingPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentPlan: Plan = status?.plan ?? "free";

  async function handleUpgrade(plan: "solo" | "pro" | "agency") {
    setError(null);
    setLoadingPlan(plan);
    try {
      const { checkoutUrl } = await createCheckout({
        plan,
        returnUrl: `${window.location.origin}/billing?upgraded=1`,
      });
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoadingPlan(null);
    }
  }

  if (isLoading || status === undefined) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renewalDate = status?.planRenewalDate
    ? new Date(status.planRenewalDate).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] px-4 py-16">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-white">Billing & Plans</h1>
          <p className="text-[#8b8b9e] mt-2">
            You&apos;re on the{" "}
            <span className="text-indigo-400 font-semibold capitalize">{currentPlan}</span> plan.
            {renewalDate && (
              <span className="text-[#8b8b9e]"> Renews {renewalDate}.</span>
            )}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            const isPaid = plan.price !== null && plan.price > 0;
            const isDowngrade =
              isPaid &&
              PLANS.findIndex((p) => p.id === currentPlan) >
                PLANS.findIndex((p) => p.id === plan.id);

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  isCurrent
                    ? "border-indigo-500/60 bg-indigo-500/5"
                    : "border-[#1e1e2e] bg-[#13131a]"
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-0.5 text-xs font-semibold text-white">
                    Current plan
                  </span>
                )}

                {/* Plan header */}
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-white">{plan.name}</h2>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-bold text-white">{plan.priceLabel}</span>
                    {plan.price !== null && plan.price > 0 && (
                      <span className="text-sm text-[#4a4a5e]">/mo</span>
                    )}
                  </div>
                  <p className="text-xs text-[#6b6b7e] mt-1.5">{plan.description}</p>
                </div>

                {/* Features */}
                <ul className="flex-1 space-y-2 mb-6">
                  {plan.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-[#c4c4d4]">
                      <CheckIcon />
                      {h}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrent ? (
                  <div className="rounded-lg border border-indigo-500/30 px-4 py-2 text-center text-sm font-medium text-indigo-400">
                    Active
                  </div>
                ) : plan.id === "free" ? (
                  <div className="rounded-lg border border-[#2a2a3e] px-4 py-2 text-center text-sm text-[#4a4a5e]">
                    {isDowngrade ? "Cancel to downgrade" : "Your current tier"}
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.id as "solo" | "pro" | "agency")}
                    disabled={loadingPlan !== null}
                    className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    {loadingPlan === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Redirecting…
                      </span>
                    ) : (
                      `Upgrade to ${plan.name}`
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Limits summary */}
        <div className="mt-12 rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Your current limits</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
            <LimitItem
              label="Keywords"
              value={getKeywordLimit(currentPlan) === Infinity ? "Unlimited" : String(getKeywordLimit(currentPlan))}
            />
            <LimitItem
              label="Leads / mo"
              value={getLeadLimit(currentPlan) === Infinity ? "Unlimited" : String(getLeadLimit(currentPlan))}
            />
            <LimitItem label="Instant alerts" value={hasInstantAlerts(currentPlan) ? "Yes" : "No"} />
            <LimitItem label="AI reply drafts" value={hasAIReply(currentPlan) ? "Yes" : "No"} />
            <LimitItem label="Slack" value={hasSlack(currentPlan) ? "Yes" : "No"} />
            <LimitItem label="Team seats" value={hasTeamSeats(currentPlan) ? "Yes" : "No"} />
          </div>
        </div>

        {/* Cancel note for paid users */}
        {currentPlan !== "free" && (
          <p className="mt-6 text-center text-xs text-[#4a4a5e]">
            To cancel your subscription, manage it via the link in your payment confirmation email.
            Cancellations take effect at the end of the billing period.
          </p>
        )}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg
      className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 8l3.5 3.5L13 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LimitItem({ label, value }: { label: string; value: string }) {
  const positive = value === "Yes" || value === "Unlimited";
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[#4a4a5e]">{label}</span>
      <span className={positive ? "text-indigo-400 font-semibold" : "text-[#6b6b7e]"}>
        {value}
      </span>
    </div>
  );
}
