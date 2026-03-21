"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const INIT_COLORS = [
  "bg-indigo-500/20 text-indigo-400",
  "bg-emerald-500/20 text-emerald-400",
  "bg-purple-500/20 text-purple-400",
  "bg-amber-500/20 text-amber-400",
  "bg-blue-500/20 text-blue-400",
];

const FALLBACK = [
  {
    name: "Sarah K.",
    niche: "UI/UX Designer",
    result:
      "Got 3 client inquiries in my first week. One turned into a $4,800 project. The AI scoring alone saves me hours of scrolling.",
  },
  {
    name: "Marcus R.",
    niche: "Full-stack Developer",
    result:
      "I was manually checking r/forhire every morning. LeadPulse replaced that habit entirely. Landed 2 clients last month I'd never have seen.",
  },
  {
    name: "Priya N.",
    niche: "SEO Consultant",
    result:
      "I only reply to leads scored 80+. My close rate tripled. Best $35 I spend each month — by a wide margin.",
  },
];

export function TestimonialsSection() {
  const data = useQuery(api.testimonials.getPublicTestimonials);

  const testimonials =
    data && data.length > 0
      ? data.slice(0, 3).map((t, i) => ({
          name: "LeadPulse user",
          niche: t.niche,
          result: t.resultText,
          initial: t.niche[0]?.toUpperCase() ?? "U",
          colorClass: INIT_COLORS[i % INIT_COLORS.length],
        }))
      : FALLBACK.map((t, i) => ({
          ...t,
          initial: t.name[0],
          colorClass: INIT_COLORS[i % INIT_COLORS.length],
        }));

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
      {testimonials.map((t, i) => (
        <div
          key={i}
          className={`fade-up fade-delay-${i + 1} flex flex-col gap-5 rounded-2xl border border-[#1e1e2e] bg-[#13131a] p-6`}
        >
          {/* Quote mark */}
          <svg
            width="24"
            height="18"
            viewBox="0 0 24 18"
            fill="none"
            className="text-indigo-500/40"
          >
            <path
              d="M0 18V10.8C0 4.8 3.6 1.2 10.8 0l1.2 2.4C8.4 3.6 6.6 5.4 6 8.4h4.8V18H0zm13.2 0V10.8C13.2 4.8 16.8 1.2 24 0l1.2 2.4C21.6 3.6 19.8 5.4 19.2 8.4H24V18H13.2z"
              fill="currentColor"
            />
          </svg>

          <p className="flex-1 text-sm leading-relaxed text-[#c4c4d4]">
            {t.result}
          </p>

          <div className="flex items-center gap-3 border-t border-[#1e1e2e] pt-4">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${t.colorClass}`}
            >
              {t.initial}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">{t.name}</div>
              <div className="text-xs text-[#6b6b7e]">{t.niche}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
