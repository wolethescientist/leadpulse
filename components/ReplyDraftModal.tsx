"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

type Tone = "professional" | "friendly" | "brief";

const TONE_OPTIONS: { value: Tone; label: string; description: string }[] = [
  { value: "professional", label: "Professional", description: "Formal, credibility-focused" },
  { value: "friendly", label: "Friendly", description: "Warm, approachable tone" },
  { value: "brief", label: "Brief", description: "Short and to the point" },
];

interface ReplyDraftModalProps {
  leadId: Id<"leads">;
  postTitle: string;
  postBody: string;
  onClose: () => void;
}

export function ReplyDraftModal({
  leadId,
  postTitle,
  postBody,
  onClose,
}: ReplyDraftModalProps) {
  const [tone, setTone] = useState<Tone>("professional");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [variationNum, setVariationNum] = useState(1);
  const [copied, setCopied] = useState(false);
  const [postExpanded, setPostExpanded] = useState(false);

  const generate = useAction(api.replyDraft.generateReplyDraft);

  async function handleGenerate(variation: number) {
    setLoading(true);
    setError("");
    try {
      const result = await generate({ leadId, tone, variationNum: variation });
      setReply(result.reply);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to generate reply.";
      setError(msg.replace(/^ConvexError: /, ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerate() {
    const next = variationNum + 1;
    setVariationNum(next);
    await handleGenerate(next);
  }

  async function handleCopy() {
    if (!reply) return;
    await navigator.clipboard.writeText(reply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[#13131a] border border-[#2a2a3e] rounded-t-2xl sm:rounded-2xl w-full max-w-lg mx-0 sm:mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e2e] shrink-0">
          <div className="flex items-center gap-2">
            <PencilSparkIcon />
            <span className="text-sm font-semibold text-white">Draft reply</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#4a4a5e] hover:text-white transition"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Collapsed post preview */}
          <div className="rounded-xl border border-[#1e1e2e] bg-[#0d0d14] overflow-hidden">
            <button
              onClick={() => setPostExpanded((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-left"
            >
              <span className="text-sm font-medium text-[#c4c4d4] line-clamp-1 flex-1 pr-2">
                {postTitle}
              </span>
              <ChevronIcon expanded={postExpanded} />
            </button>
            {postExpanded && (
              <div className="px-4 pb-3">
                <p className="text-xs text-[#6b6b7e] whitespace-pre-wrap leading-relaxed">
                  {postBody.slice(0, 800)}
                  {postBody.length > 800 && "…"}
                </p>
              </div>
            )}
          </div>

          {/* Tone selector */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-[#6b6b7e] uppercase tracking-wider">
              Tone
            </p>
            <div className="grid grid-cols-3 gap-2">
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTone(opt.value)}
                  className={`rounded-xl border p-3 text-left transition ${
                    tone === opt.value
                      ? "border-indigo-500/60 bg-indigo-500/10"
                      : "border-[#2a2a3e] hover:border-[#3a3a4e] bg-[#0d0d14]"
                  }`}
                >
                  <div
                    className={`text-sm font-medium ${
                      tone === opt.value ? "text-indigo-300" : "text-white"
                    }`}
                  >
                    {opt.label}
                  </div>
                  <div className="text-xs text-[#4a4a5e] mt-0.5">
                    {opt.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate button */}
          {!reply && !loading && (
            <button
              onClick={() => handleGenerate(variationNum)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <SparkleIcon />
              Generate reply
            </button>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-2 animate-pulse">
              <div className="h-4 bg-[#1e1e2e] rounded w-full" />
              <div className="h-4 bg-[#1e1e2e] rounded w-5/6" />
              <div className="h-4 bg-[#1e1e2e] rounded w-4/6" />
              <div className="h-4 bg-[#1e1e2e] rounded w-5/6" />
            </div>
          )}

          {/* Reply textarea */}
          {reply && !loading && (
            <div className="space-y-3">
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={6}
                className="w-full bg-[#0d0d14] border border-[#2a2a3e] rounded-xl px-4 py-3 text-sm text-white leading-relaxed resize-none focus:outline-none focus:border-indigo-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition border ${
                    copied
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                      : "border-[#2a2a3e] hover:border-[#3a3a4e] text-[#8b8b9e] hover:text-white"
                  }`}
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                  {copied ? "Copied!" : "Copy to clipboard"}
                </button>
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-[#2a2a3e] hover:border-[#3a3a4e] text-[#8b8b9e] hover:text-white disabled:opacity-40 transition"
                >
                  <RefreshIcon />
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Icons ---

function PencilSparkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-indigo-400">
      <path d="M9.5 2.5L13.5 6.5L5 15H1V11L9.5 2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 4.5L11.5 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
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

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className={`text-[#4a4a5e] transition-transform shrink-0 ${expanded ? "rotate-180" : ""}`}
    >
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1v2M7 11v2M1 7h2M11 7h2M3.05 3.05l1.42 1.42M9.53 9.53l1.42 1.42M3.05 10.95l1.42-1.42M9.53 4.47l1.42-1.42" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="4.5" y="4.5" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 9.5V2H9.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M12 7A5 5 0 112 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M12 3v4H8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
