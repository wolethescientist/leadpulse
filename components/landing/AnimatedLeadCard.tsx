"use client";

import { useState, useEffect } from "react";

const SCORE_COLOR = (s: number) =>
  s >= 90
    ? { badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", glow: "rgba(52,211,153,0.25)" }
    : s >= 75
    ? { badge: "bg-amber-500/20 text-amber-400 border-amber-500/30", glow: "rgba(251,191,36,0.22)" }
    : { badge: "bg-white/[0.06] text-[#8888a8] border-white/[0.08]", glow: "rgba(99,102,241,0.15)" };

const LEADS = [
  {
    score: 94,
    sourceLabel: "r/forhire",
    sourceStyle: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    title: "Hiring: Need React developer to build SaaS admin dashboard — startup, budget flexible",
    signals: ["Urgent", "Budget"],
    keyword: "React developer",
    minutesAgo: 3,
  },
  {
    score: 88,
    sourceLabel: "Hacker News",
    sourceStyle: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    title: "Ask HN: Looking for a freelance designer to redesign our pricing page this week",
    signals: ["Switching", "Evaluating"],
    keyword: "freelance designer",
    minutesAgo: 7,
  },
  {
    score: 91,
    sourceLabel: "r/freelance",
    sourceStyle: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    title: "Need a copywriter to rewrite our homepage — tried twice, still not converting",
    signals: ["Switching", "Budget"],
    keyword: "copywriter",
    minutesAgo: 14,
  },
  {
    score: 86,
    sourceLabel: "Remotive",
    sourceStyle: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    title: "Contract SEO consultant needed for B2B SaaS — immediate start, 3-month engagement",
    signals: ["Urgent"],
    keyword: "SEO consultant",
    minutesAgo: 21,
  },
  {
    score: 79,
    sourceLabel: "We Work Remotely",
    sourceStyle: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    title: "Seeking video editor for YouTube channel — 4–8 videos/month, ongoing work",
    signals: ["Evaluating"],
    keyword: "video editor",
    minutesAgo: 28,
  },
];

export function AnimatedLeadCard() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const totalDuration = 4000;
    const tickInterval = 50;
    let elapsed = 0;

    const ticker = setInterval(() => {
      elapsed += tickInterval;
      setProgress((elapsed / totalDuration) * 100);

      if (elapsed >= totalDuration) {
        elapsed = 0;
        setProgress(0);
        setVisible(false);
        setTimeout(() => {
          setIndex((i) => (i + 1) % LEADS.length);
          setVisible(true);
        }, 200);
      }
    }, tickInterval);

    return () => clearInterval(ticker);
  }, [index]);

  const lead = LEADS[index];
  const scoreColors = SCORE_COLOR(lead.score);

  return (
    <div className="relative select-none">
      {/* Layered ambient glow */}
      <div
        className="glow-pulse pointer-events-none absolute -inset-16 rounded-3xl"
        style={{
          background: `radial-gradient(ellipse at 50% 55%, ${scoreColors.glow} 0%, rgba(99,102,241,0.06) 45%, transparent 70%)`,
        }}
      />

      {/* Live feed header */}
      <div className="mb-3 flex items-center gap-2 px-1">
        <div className="relative flex h-2 w-2 items-center justify-center">
          <span className="pulse-ring absolute h-2 w-2 rounded-full bg-emerald-400/40" />
          <span className="blink-dot h-2 w-2 rounded-full bg-emerald-400" />
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#52526a]">
          Live feed
        </span>
        <span className="ml-auto font-mono text-[10px] text-[#303048]">
          {LEADS.length} new today
        </span>
      </div>

      {/* Card with transition */}
      <div
        key={index}
        className="relative overflow-hidden rounded-2xl border"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          backgroundColor: "#0e0e18",
          boxShadow: `0 0 0 1px rgba(99,102,241,0.08), 0 28px 72px rgba(0,0,0,0.7), 0 0 48px ${scoreColors.glow}`,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(8px) scale(0.98)",
          transition: "opacity 0.25s ease, transform 0.25s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Top gradient line */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(139,92,246,0.4), transparent)" }}
        />

        <div className="p-5">
          {/* Header row */}
          <div className="mb-3.5 flex items-center gap-2">
            <span
              className={`score-pop inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold tabular-nums ${scoreColors.badge}`}
            >
              {lead.score}
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${lead.sourceStyle}`}
            >
              {lead.sourceLabel}
            </span>
            <span className="ml-auto font-mono text-[10px] text-[#303048]">
              {lead.minutesAgo}m ago
            </span>
          </div>

          {/* Title */}
          <p className="mb-3.5 text-sm font-semibold leading-snug text-[#eeeef8]">
            {lead.title}
          </p>

          {/* Signals + keyword */}
          <div className="stagger flex flex-wrap items-center gap-1.5">
            {lead.signals.map((s) => (
              <span
                key={s}
                className="chip-pop inline-flex items-center rounded-full border border-white/[0.07] bg-white/[0.04] px-2.5 py-0.5 text-xs text-[#8888a8]"
              >
                {s}
              </span>
            ))}
            <span className="chip-pop inline-flex items-center rounded-full border border-indigo-500/25 bg-indigo-500/10 px-2.5 py-0.5 text-xs text-indigo-300">
              {lead.keyword}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-[2px] bg-white/[0.04]">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Dot indicators */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {LEADS.map((_, i) => (
          <button
            key={i}
            onClick={() => { setIndex(i); setVisible(true); setProgress(0); }}
            aria-label={`Show lead ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              height: "5px",
              width: i === index ? "20px" : "5px",
              background: i === index
                ? "linear-gradient(90deg, #6366f1, #a78bfa)"
                : "rgba(255,255,255,0.1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
