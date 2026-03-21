"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { TestimonialModal } from "./TestimonialModal";
interface NPSPopupProps {
  /** Unix ms of user account creation (_creationTime) */
  userCreatedAt: number;
  npsScore: number | undefined;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function NPSPopup({ userCreatedAt, npsScore }: NPSPopupProps) {
  const [dismissed, setDismissed] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [improvement, setImprovement] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showTestimonial, setShowTestimonial] = useState(false);

  const submitNPS = useMutation(api.feedback.submitNPS);

  // Conditions to show
  const accountOldEnough = Date.now() - userCreatedAt >= SEVEN_DAYS_MS;
  const notYetAnswered = npsScore === undefined || npsScore === null;

  if (!accountOldEnough || !notYetAnswered || dismissed) return null;
  if (showTestimonial) {
    return (
      <TestimonialModal
        onClose={() => setShowTestimonial(false)}
      />
    );
  }

  async function handleScore(score: number) {
    setSelected(score);
    // Promoters (9-10): save + open testimonial modal
    // Others: save + show improvement field
    await submitNPS({ score });
    if (score >= 9) {
      setSubmitted(true);
      setTimeout(() => setShowTestimonial(true), 400);
    }
    // For 1-8 the user needs to fill the improvement box then submit
  }

  async function handleImprovementSubmit() {
    // NPS already saved in handleScore; just dismiss
    setSubmitted(true);
    setTimeout(() => setDismissed(true), 800);
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[340px] rounded-2xl border border-[#1e1e2e] bg-[#0d0d14] shadow-2xl p-6 animate-in slide-in-from-bottom-4 duration-300">
      {/* Close */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-4 right-4 text-[#4a4a5e] hover:text-[#8b8b9e] transition"
        aria-label="Dismiss"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M1 1l12 12M13 1L1 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {submitted ? (
        <div className="flex flex-col items-center gap-2 py-2">
          <span className="text-2xl">🙏</span>
          <p className="text-sm font-semibold text-white text-center">
            Thanks for the feedback!
          </p>
        </div>
      ) : selected !== null && selected < 9 ? (
        /* Improvement input for detractors/passives */
        <div>
          <p className="text-sm font-semibold text-white mb-1">
            What can we improve?
          </p>
          <p className="text-xs text-[#6b6b7e] mb-3">
            Help us make LeadPulse better for you.
          </p>
          <textarea
            value={improvement}
            onChange={(e) => setImprovement(e.target.value)}
            placeholder="Tell us what's missing or frustrating…"
            rows={3}
            className="w-full rounded-lg border border-[#2a2a3e] bg-[#0a0a0f] px-3 py-2 text-sm text-white placeholder-[#4a4a5e] outline-none resize-none focus:border-indigo-500/60 transition"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleImprovementSubmit}
              className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-xs font-semibold text-white transition"
            >
              Submit
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="rounded-lg border border-[#2a2a3e] px-3 py-2 text-xs text-[#6b6b7e] hover:text-[#8b8b9e] transition"
            >
              Skip
            </button>
          </div>
        </div>
      ) : (
        /* Score picker */
        <div>
          <p className="text-sm font-semibold text-white mb-1">
            How likely are you to recommend LeadPulse?
          </p>
          <p className="text-xs text-[#6b6b7e] mb-4">
            1 = Not at all &nbsp;·&nbsp; 10 = Absolutely
          </p>
          <div className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => handleScore(n)}
                className={`rounded-lg border py-2 text-sm font-semibold transition ${
                  selected === n
                    ? "border-indigo-500 bg-indigo-500/20 text-indigo-300"
                    : "border-[#2a2a3e] text-[#8b8b9e] hover:border-[#3a3a4e] hover:text-white"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="mt-3 w-full text-xs text-[#4a4a5e] hover:text-[#6b6b7e] transition"
          >
            Maybe later
          </button>
        </div>
      )}
    </div>
  );
}
