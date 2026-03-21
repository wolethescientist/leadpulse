"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
interface TestimonialModalProps {
  onClose: () => void;
}

export function TestimonialModal({ onClose }: TestimonialModalProps) {
  const [niche, setNiche] = useState("");
  const [resultText, setResultText] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submitTestimonial = useMutation(api.feedback.submitTestimonial);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!niche.trim() || !resultText.trim()) return;
    setSubmitting(true);
    try {
      await submitTestimonial({ niche, resultText, isPublic });
      setDone(true);
      setTimeout(onClose, 1800);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#1e1e2e] bg-[#0d0d14] shadow-2xl p-8">
        {done ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="text-3xl">🎉</div>
            <p className="text-base font-semibold text-white">Thanks so much!</p>
            <p className="text-sm text-[#6b6b7e] text-center">
              Your story helps other freelancers discover LeadPulse.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">
                Share your result
              </h2>
              <p className="text-sm text-[#6b6b7e]">
                A quick win story goes a long way for other freelancers.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#8b8b9e] mb-1.5">
                  Your niche
                </label>
                <input
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. React developer, SEO consultant…"
                  className="w-full rounded-lg border border-[#2a2a3e] bg-[#0a0a0f] px-3 py-2.5 text-sm text-white placeholder-[#4a4a5e] outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#8b8b9e] mb-1.5">
                  Your result
                </label>
                <textarea
                  value={resultText}
                  onChange={(e) => setResultText(e.target.value)}
                  placeholder="e.g. Landed a $3k project within 48 hours of my first lead…"
                  rows={4}
                  className="w-full rounded-lg border border-[#2a2a3e] bg-[#0a0a0f] px-3 py-2.5 text-sm text-white placeholder-[#4a4a5e] outline-none resize-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition"
                />
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative mt-0.5">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                      isPublic
                        ? "bg-indigo-600 border-indigo-600"
                        : "bg-[#0a0a0f] border-[#3a3a4e]"
                    }`}
                  >
                    {isPublic && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4l3 3 5-6"
                          stroke="#fff"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-[#8b8b9e]">
                  Happy for this to be featured on the LeadPulse website
                </span>
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !niche.trim() || !resultText.trim()}
                  className="flex-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed px-4 py-2.5 text-sm font-semibold text-white transition flex items-center justify-center gap-2"
                >
                  {submitting && (
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  )}
                  {submitting ? "Submitting…" : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-[#2a2a3e] hover:border-[#3a3a4e] px-4 py-2.5 text-sm text-[#6b6b7e] hover:text-[#8b8b9e] transition"
                >
                  Skip
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
