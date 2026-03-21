"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface FeedbackPromptProps {
  leadId: Id<"leads">;
  onDone: () => void;
}

export function FeedbackPrompt({ leadId, onDone }: FeedbackPromptProps) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submitFeedback = useMutation(api.leads.submitFeedback);

  async function handleSubmit() {
    setSubmitting(true);
    await submitFeedback({
      leadId,
      feedback: "bad",
      ...(note.trim() ? { feedbackNote: note.trim() } : {}),
    });
    setSubmitting(false);
    onDone();
  }

  return (
    <div className="mt-3 rounded-lg border border-[#2a2a3e] bg-[#0e0e18] p-3">
      <p className="text-xs font-medium text-[#8b8b9e] mb-2">
        What was wrong with this lead?
      </p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Optional — help us improve your feed"
        rows={2}
        className="w-full rounded-md bg-[#13131a] border border-[#2a2a3e] px-3 py-2 text-xs text-white placeholder-[#4a4a5e] outline-none resize-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition"
      />
      <div className="flex gap-2 mt-2">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition px-3 py-1.5 text-xs font-semibold text-white"
        >
          {submitting ? "Sending…" : "Submit"}
        </button>
        <button
          onClick={onDone}
          className="rounded-md border border-[#2a2a3e] hover:border-[#3a3a4e] transition px-3 py-1.5 text-xs text-[#6b6b7e] hover:text-[#8b8b9e]"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
