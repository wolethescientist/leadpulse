"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  NICHE_PACKS,
  NICHE_LABELS,
  type Niche,
} from "@/lib/niche-packs";
import { hasInstantAlerts, type Plan } from "@/lib/plan-limits";

type Platform = "reddit" | "hackernews" | "remotive" | "weworkremotely";

const ALL_PLATFORMS: Platform[] = [
  "reddit",
  "hackernews",
  "remotive",
  "weworkremotely",
];

const PLATFORM_LABELS: Record<Platform, { label: string; description: string }> = {
  reddit: { label: "Reddit", description: "r/forhire, r/freelance & more" },
  hackernews: { label: "Hacker News", description: "Who's hiring threads" },
  remotive: { label: "Remotive", description: "Remote job board" },
  weworkremotely: { label: "We Work Remotely", description: "Remote jobs board" },
};

const TOTAL_STEPS = 5;

interface SetupWizardProps {
  wizardCompleted: boolean;
  plan: Plan;
}

export function SetupWizard({
  wizardCompleted,
  plan,
}: SetupWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedNiche, setSelectedNiche] = useState<Niche | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [activePlatforms, setActivePlatforms] =
    useState<Platform[]>(ALL_PLATFORMS);
  const [instantAlerts, setInstantAlerts] = useState(false);
  const [saving, setSaving] = useState(false);

  const saveWizardSetup = useMutation(api.onboarding.saveWizardSetup);

  if (wizardCompleted) return null;

  function pickNiche(niche: Niche) {
    setSelectedNiche(niche);
    setKeywords(NICHE_PACKS[niche]);
  }

  function addKeyword() {
    const term = keywordInput.trim();
    if (!term || keywords.includes(term)) return;
    setKeywords((prev) => [...prev, term]);
    setKeywordInput("");
  }

  function removeKeyword(kw: string) {
    setKeywords((prev) => prev.filter((k) => k !== kw));
  }

  function togglePlatform(p: Platform) {
    setActivePlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  async function handleFinish() {
    setSaving(true);
    try {
      await saveWizardSetup({
        keywords,
        activePlatforms,
        instantAlerts,
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleSkip() {
    setSaving(true);
    try {
      await saveWizardSetup({
        keywords: [],
        activePlatforms: ALL_PLATFORMS,
        instantAlerts: false,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#1e1e2e] bg-[#0d0d14] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-[#4a4a5e] uppercase tracking-wider">
              Setup — Step {step + 1} of {TOTAL_STEPS}
            </span>
            <button
              onClick={handleSkip}
              disabled={saving}
              className="text-xs text-[#4a4a5e] hover:text-[#8b8b9e] transition disabled:opacity-50"
            >
              Skip setup
            </button>
          </div>
        </div>

        {/* Step content */}
        <div className="px-8 py-6 flex-1 min-h-[340px]">
          {step === 0 && (
            <StepNiche selected={selectedNiche} onPick={pickNiche} />
          )}
          {step === 1 && (
            <StepKeywords
              keywords={keywords}
              input={keywordInput}
              onInputChange={setKeywordInput}
              onAdd={addKeyword}
              onRemove={removeKeyword}
            />
          )}
          {step === 2 && (
            <StepSources
              active={activePlatforms}
              onToggle={togglePlatform}
            />
          )}
          {step === 3 && (
            <StepAlerts
              value={instantAlerts}
              onChange={setInstantAlerts}
              plan={plan}
            />
          )}
          {step === 4 && (
            <StepConfirm
              niche={selectedNiche}
              keywords={keywords}
              platforms={activePlatforms}
              instantAlerts={instantAlerts}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-4 border-t border-[#1e1e2e] flex items-center justify-between">
          {/* Progress dots */}
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  i === step
                    ? "w-5 h-2 bg-indigo-500"
                    : i < step
                    ? "w-2 h-2 bg-indigo-500/40"
                    : "w-2 h-2 bg-[#2a2a3e]"
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                disabled={saving}
                className="rounded-lg border border-[#2a2a3e] hover:border-[#3a3a4e] px-4 py-2 text-sm text-[#8b8b9e] transition disabled:opacity-50"
              >
                Back
              </button>
            )}
            {step < TOTAL_STEPS - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 0 && !selectedNiche}
                className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm font-semibold text-white transition"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                className="rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 px-5 py-2 text-sm font-semibold text-white transition flex items-center gap-2"
              >
                {saving && (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {saving ? "Saving…" : "Start finding leads →"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step components ────────────────────────────────────────────────────────

function StepNiche({
  selected,
  onPick,
}: {
  selected: Niche | null;
  onPick: (n: Niche) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Pick your niche</h2>
      <p className="text-sm text-[#6b6b7e] mb-5">
        We&apos;ll auto-load the best keywords for your niche.
      </p>
      <div className="grid grid-cols-1 gap-2">
        {(Object.keys(NICHE_LABELS) as Niche[]).map((niche) => {
          const { label, emoji, description } = NICHE_LABELS[niche];
          const isSelected = selected === niche;
          return (
            <button
              key={niche}
              onClick={() => onPick(niche)}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                isSelected
                  ? "border-indigo-500/60 bg-indigo-500/10"
                  : "border-[#2a2a3e] hover:border-[#3a3a4e] hover:bg-[#1e1e2e]"
              }`}
            >
              <span className="text-2xl">{emoji}</span>
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-[#6b6b7e]">{description}</p>
              </div>
              {isSelected && (
                <span className="ml-auto">
                  <CheckCircle />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepKeywords({
  keywords,
  input,
  onInputChange,
  onAdd,
  onRemove,
}: {
  keywords: string[];
  input: string;
  onInputChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (kw: string) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Edit your keywords</h2>
      <p className="text-sm text-[#6b6b7e] mb-4">
        LeadPulse alerts you when these phrases appear in posts.
      </p>
      <div className="flex gap-2 mb-4">
        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          placeholder="Add a keyword…"
          className="flex-1 rounded-lg border border-[#2a2a3e] bg-[#0a0a0f] px-3 py-2 text-sm text-white placeholder-[#4a4a5e] outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition"
        />
        <button
          onClick={onAdd}
          className="rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-2 text-sm font-semibold text-white transition"
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
        {keywords.length === 0 && (
          <p className="text-xs text-[#4a4a5e]">No keywords yet — add some above.</p>
        )}
        {keywords.map((kw) => (
          <span
            key={kw}
            className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 pl-3 pr-2 py-1 text-xs text-indigo-300"
          >
            {kw}
            <button
              onClick={() => onRemove(kw)}
              className="text-indigo-400/60 hover:text-indigo-400 transition"
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function StepSources({
  active,
  onToggle,
}: {
  active: Platform[];
  onToggle: (p: Platform) => void;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Choose your sources</h2>
      <p className="text-sm text-[#6b6b7e] mb-5">
        All sources are on by default. Toggle any you don&apos;t want.
      </p>
      <div className="space-y-2">
        {ALL_PLATFORMS.map((p) => {
          const { label, description } = PLATFORM_LABELS[p];
          const on = active.includes(p);
          return (
            <button
              key={p}
              onClick={() => onToggle(p)}
              className={`w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition ${
                on
                  ? "border-indigo-500/40 bg-indigo-500/5"
                  : "border-[#2a2a3e] opacity-50"
              }`}
            >
              <div className="text-left">
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-[#6b6b7e]">{description}</p>
              </div>
              <Toggle on={on} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StepAlerts({
  value,
  onChange,
  plan,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  plan: Plan;
}) {
  const canInstant = hasInstantAlerts(plan);
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Alert preference</h2>
      <p className="text-sm text-[#6b6b7e] mb-5">
        How often should we notify you about new leads?
      </p>
      <div className="space-y-3">
        {[
          {
            val: false,
            label: "Daily digest",
            description: "A summary of new leads sent each morning",
            locked: false,
          },
          {
            val: true,
            label: "Instant alerts",
            description: "Get notified the moment a lead arrives (Pro+)",
            locked: !canInstant,
          },
        ].map(({ val, label, description, locked }) => (
          <button
            key={String(val)}
            onClick={() => !locked && onChange(val)}
            disabled={locked}
            className={`w-full flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition text-left ${
              locked
                ? "border-[#2a2a3e] opacity-40 cursor-not-allowed"
                : value === val
                ? "border-indigo-500/60 bg-indigo-500/10"
                : "border-[#2a2a3e] hover:border-[#3a3a4e]"
            }`}
          >
            <div>
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                {label}
                {locked && (
                  <span className="text-xs text-[#4a4a5e] font-normal">
                    — upgrade required
                  </span>
                )}
              </p>
              <p className="text-xs text-[#6b6b7e]">{description}</p>
            </div>
            {value === val && !locked && <CheckCircle />}
          </button>
        ))}
      </div>
    </div>
  );
}

function StepConfirm({
  niche,
  keywords,
  platforms,
  instantAlerts,
}: {
  niche: Niche | null;
  keywords: string[];
  platforms: Platform[];
  instantAlerts: boolean;
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-white mb-1">Ready to go 🚀</h2>
      <p className="text-sm text-[#6b6b7e] mb-5">
        Here&apos;s what we&apos;ll set up for you. Hit the button below to start.
      </p>
      <div className="space-y-3 text-sm">
        <ConfirmRow
          label="Niche"
          value={niche ? NICHE_LABELS[niche].label : "None selected"}
        />
        <ConfirmRow
          label="Keywords"
          value={
            keywords.length > 0
              ? `${keywords.length} keyword${keywords.length !== 1 ? "s" : ""}`
              : "None"
          }
        />
        <ConfirmRow
          label="Sources"
          value={
            platforms.length > 0
              ? platforms
                  .map((p) => PLATFORM_LABELS[p].label)
                  .join(", ")
              : "None"
          }
        />
        <ConfirmRow
          label="Alerts"
          value={instantAlerts ? "Instant" : "Daily digest"}
        />
      </div>
    </div>
  );
}

// ─── Micro-components ───────────────────────────────────────────────────────

function ConfirmRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-[#2a2a3e] bg-[#0a0a0f] px-4 py-2.5">
      <span className="text-[#6b6b7e]">{label}</span>
      <span className="text-white text-right">{value}</span>
    </div>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <div
      className={`relative flex shrink-0 items-center rounded-full transition-colors w-9 h-5 ${
        on ? "bg-indigo-600" : "bg-[#2a2a3e]"
      }`}
    >
      <span
        className={`absolute rounded-full bg-white shadow w-3.5 h-3.5 transition-transform ${
          on ? "translate-x-[18px]" : "translate-x-1"
        }`}
      />
    </div>
  );
}

function CheckCircle() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className="shrink-0 text-indigo-400"
    >
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.5 9l2.5 2.5 4.5-5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
