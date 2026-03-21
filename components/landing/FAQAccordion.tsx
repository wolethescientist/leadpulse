"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "How does LeadPulse find leads?",
    a: "LeadPulse monitors Reddit (r/forhire, r/freelance, and niche subreddits), Hacker News hiring threads, Remotive, and We Work Remotely every hour. When a new post matches your keywords it's scored and surfaced to your dashboard instantly.",
  },
  {
    q: "How does the AI scoring work?",
    a: "Each lead is scored 0–100 based on five buying signals found in the post text: urgency (\"need it this week\"), budget intent (\"paying well\"), switching intent (\"tried X, it didn't work\"), evaluation intent (\"comparing options\"), and automation intent. Higher score = more likely to convert.",
  },
  {
    q: "How is this different from SubredditSignals?",
    a: "SubredditSignals monitors Reddit only. LeadPulse also covers Hacker News hiring threads, Remotive, and We Work Remotely. We score every lead with intent signals, support niche keyword packs, and generate AI-drafted outreach replies — not just a raw list of posts.",
  },
  {
    q: "Will my keywords create too much noise?",
    a: "Start with our niche packs — pre-built keyword sets tuned for designers, developers, copywriters, SEO consultants, and video editors. The AI scoring then filters low-intent posts automatically. Most users find 8–12 keywords is the sweet spot.",
  },
  {
    q: "Can I use this if I'm not technical?",
    a: "Absolutely. Setup takes under 2 minutes: pick a niche pack, choose your sources, and you're done. No API keys, no configuration, no code. If you can use Gmail, you can use LeadPulse.",
  },
  {
    q: "What happens after the 7-day free trial?",
    a: "You're automatically downgraded to the Free plan — 3 keywords, 10 leads/month, daily digest. No charge. No credit card required to start. Upgrade whenever you're ready.",
  },
];

export function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-2">
      {FAQS.map((faq, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-[#1e1e2e] bg-[#13131a]"
        >
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="group flex w-full items-center justify-between px-5 py-4 text-left"
          >
            <span className="text-sm font-semibold text-white transition group-hover:text-indigo-300">
              {faq.q}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={`ml-4 shrink-0 text-[#4a4a5e] transition-transform duration-300 ${
                open === i ? "rotate-180" : ""
              }`}
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <div
            className="accordion-body"
            style={{
              maxHeight: open === i ? "280px" : "0px",
              opacity: open === i ? 1 : 0,
            }}
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-[#8b8b9e]">
              {faq.a}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
