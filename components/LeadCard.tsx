"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { FeedbackPrompt } from "./FeedbackPrompt";
import { ReplyDraftModal } from "./ReplyDraftModal";
import { UpgradeModal } from "./UpgradeModal";
import type { Plan } from "@/lib/plan-limits";

interface Signals {
  switching_intent?: boolean;
  budget_intent?: boolean;
  urgency_intent?: boolean;
  evaluation_intent?: boolean;
  automation_intent?: boolean;
}

type LeadWithPost = Doc<"leads"> & {
  post: Doc<"rawPosts">;
};

interface LeadCardProps {
  lead: LeadWithPost;
  plan: Plan;
  canDraftReply: boolean;
  highlight?: boolean;
  id?: string;
}

const SOURCE_LABELS: Record<string, string> = {
  reddit: "Reddit",
  hackernews: "HN",
  remotive: "Remotive",
  weworkremotely: "WWR",
};

const SOURCE_COLORS: Record<string, string> = {
  reddit:          "bg-orange-500/15 text-orange-400 border-orange-500/20",
  hackernews:      "bg-amber-500/15 text-amber-400 border-amber-500/20",
  remotive:        "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  weworkremotely:  "bg-blue-500/15 text-blue-400 border-blue-500/20",
};

const SIGNAL_LABELS: Array<{ key: keyof Signals; label: string }> = [
  { key: "switching_intent",  label: "Switching"   },
  { key: "budget_intent",     label: "Budget"      },
  { key: "urgency_intent",    label: "Urgent"      },
  { key: "evaluation_intent", label: "Evaluating"  },
  { key: "automation_intent", label: "Automation"  },
];

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function ScoreBadge({ score }: { score: number }) {
  const [style, glow] =
    score >= 90
      ? ["bg-emerald-500/20 text-emerald-400 border-emerald-500/30", "0 0 12px rgba(52,211,153,0.25)"]
      : score >= 70
      ? ["bg-amber-500/20 text-amber-400 border-amber-500/30", "0 0 12px rgba(251,191,36,0.22)"]
      : ["bg-white/[0.06] text-[#8888a8] border-white/[0.08]", "none"];

  return (
    <span
      className={`score-pop inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-xs font-bold tabular-nums ${style}`}
      style={{ boxShadow: glow }}
    >
      {score}
    </span>
  );
}

export function LeadCard({ lead, plan, canDraftReply, highlight, id }: LeadCardProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [thumbed, setThumbed] = useState<"up" | "down" | null>(
    lead.feedback === "good" ? "up" : lead.feedback === "bad" ? "down" : null
  );
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const markedViewed = useRef(false);

  const updateStatus  = useMutation(api.leads.updateLeadStatus);
  const submitFeedback = useMutation(api.leads.submitFeedback);

  useEffect(() => {
    if (!markedViewed.current && lead.status === "new") {
      markedViewed.current = true;
      updateStatus({ leadId: lead._id, status: "viewed" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signals = (lead.signals ?? {}) as Signals;
  const activeSignals = SIGNAL_LABELS.filter((s) => signals[s.key]);

  async function handleThumbUp() {
    setThumbed("up");
    setShowFeedback(false);
    await submitFeedback({ leadId: lead._id, feedback: "good" });
  }

  async function handleThumbDown() {
    setThumbed("down");
    setShowFeedback(true);
    await submitFeedback({ leadId: lead._id, feedback: "bad" });
  }

  async function handleArchive() {
    await updateStatus({ leadId: lead._id, status: "archived" });
  }

  return (
    <>
      <div
        id={id}
        className="lead-card-animate card-hover relative rounded-2xl border bg-[#0e0e18] p-5"
        style={{
          borderColor: highlight ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.07)",
          borderLeftWidth: highlight ? "3px" : undefined,
          borderLeftColor: highlight ? "#fbbf24" : undefined,
          boxShadow: highlight
            ? "0 0 24px rgba(251,191,36,0.08), inset 0 1px 0 rgba(255,255,255,0.04)"
            : "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Top gradient line for ALL cards (subtle) */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px rounded-t-2xl"
          style={{
            background: highlight
              ? "linear-gradient(90deg, transparent, rgba(251,191,36,0.4), transparent)"
              : "linear-gradient(90deg, transparent, rgba(99,102,241,0.2), transparent)",
          }}
        />

        {/* Header row */}
        <div className="mb-3.5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <ScoreBadge score={lead.score} />
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                SOURCE_COLORS[lead.post.platform] ?? "bg-white/[0.06] text-[#8888a8] border-white/[0.08]"
              }`}
            >
              {SOURCE_LABELS[lead.post.platform] ?? lead.post.platform}
            </span>
            <span className="inline-flex items-center rounded-full border border-indigo-500/25 bg-indigo-500/10 px-2 py-0.5 text-xs text-indigo-300">
              {lead.matchedKeyword}
            </span>
          </div>
          <span className="shrink-0 font-mono text-[10px] text-[#303048]">
            {timeAgo(lead.post.postedAt)}
          </span>
        </div>

        {/* Title */}
        <h3 className="mb-3.5 text-sm font-semibold text-[#eeeef8] leading-snug line-clamp-2">
          {lead.post.title}
        </h3>

        {/* Signal chips */}
        {activeSignals.length > 0 && (
          <div className="stagger flex flex-wrap gap-1.5 mb-4">
            {activeSignals.map((s) => (
              <span
                key={s.key}
                className="chip-pop inline-flex items-center rounded-full border border-white/[0.06] bg-white/[0.03] px-2.5 py-0.5 text-xs text-[#8888a8]"
              >
                {s.label}
              </span>
            ))}
          </div>
        )}

        {/* Actions row */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={lead.post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-[#8888a8] transition-all duration-150 hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white"
          >
            View post
            <ArrowUpRightIcon />
          </a>

          {canDraftReply ? (
            <button
              id="tour-draft-reply"
              onClick={() => setShowReplyModal(true)}
              className="btn-glow inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-all duration-150 hover:bg-indigo-500 hover:shadow-[0_0_16px_rgba(99,102,241,0.35)]"
            >
              <PencilIcon />
              Draft reply
            </button>
          ) : (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] px-3 py-1.5 text-xs font-medium text-[#52526a] transition-all duration-150 hover:border-white/[0.10] hover:text-[#8888a8]"
            >
              <LockIcon />
              Draft reply
            </button>
          )}

          {/* Feedback & archive */}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={handleThumbUp}
              title="Good lead"
              className={`rounded-lg border p-1.5 transition-all duration-150 ${
                thumbed === "up"
                  ? "border-emerald-500/40 bg-emerald-500/12 text-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.2)]"
                  : "border-white/[0.06] text-[#52526a] hover:border-emerald-500/30 hover:text-emerald-400"
              }`}
            >
              <ThumbUpIcon />
            </button>
            <button
              onClick={handleThumbDown}
              title="Bad lead"
              className={`rounded-lg border p-1.5 transition-all duration-150 ${
                thumbed === "down"
                  ? "border-rose-500/40 bg-rose-500/12 text-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.2)]"
                  : "border-white/[0.06] text-[#52526a] hover:border-rose-500/30 hover:text-rose-400"
              }`}
            >
              <ThumbDownIcon />
            </button>
            <button
              onClick={handleArchive}
              title="Archive"
              className="rounded-lg border border-white/[0.06] p-1.5 text-[#52526a] transition-all duration-150 hover:border-white/[0.10] hover:text-[#8888a8]"
            >
              <ArchiveIcon />
            </button>
          </div>
        </div>

        {showFeedback && (
          <FeedbackPrompt
            leadId={lead._id as Id<"leads">}
            onDone={() => setShowFeedback(false)}
          />
        )}
      </div>

      {showReplyModal && (
        <ReplyDraftModal
          leadId={lead._id}
          postTitle={lead.post.title}
          postBody={lead.post.body}
          onClose={() => setShowReplyModal(false)}
        />
      )}

      {showUpgradeModal && (
        <UpgradeModal
          currentPlan={plan}
          featureName="AI reply drafts"
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </>
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

function ArrowUpRightIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <path d="M8.5 1.5L10.5 3.5L4 10L1.5 10.5L2 8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
      <rect x="2" y="5" width="8" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M4 5V3.5a2 2 0 1 1 4 0V5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function ThumbUpIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M4.5 13V6.5L7 1.5C7.83 1.5 8.5 2.17 8.5 3V5.5H11.5C12.05 5.5 12.5 5.95 12.5 6.5L11.5 11.5C11.33 12.08 10.83 12.5 10.25 12.5H4.5M4.5 13H2.5C1.95 13 1.5 12.55 1.5 12V7C1.5 6.45 1.95 6 2.5 6H4.5V13Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ThumbDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M9.5 1V7.5L7 12.5C6.17 12.5 5.5 11.83 5.5 11V8.5H2.5C1.95 8.5 1.5 8.05 1.5 7.5L2.5 2.5C2.67 1.92 3.17 1.5 3.75 1.5H9.5M9.5 1H11.5C12.05 1 12.5 1.45 12.5 2V7C12.5 7.55 12.05 8 11.5 8H9.5V1Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1.5" y="1.5" width="11" height="3" rx="0.75" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2.5 4.5V11.5C2.5 12.05 2.95 12.5 3.5 12.5H10.5C11.05 12.5 11.5 12.05 11.5 11.5V4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M5 7.5H9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
