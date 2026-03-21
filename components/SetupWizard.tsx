"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { NICHE_PACKS, NICHE_LABELS, type Niche } from "@/lib/niche-packs";
import { hasInstantAlerts, type Plan } from "@/lib/plan-limits";

type Platform = "reddit" | "hackernews" | "remotive" | "weworkremotely";

const ALL_PLATFORMS: Platform[] = ["reddit", "hackernews", "remotive", "weworkremotely"];

const PLATFORM_META: Record<Platform, { label: string; description: string }> = {
  reddit: { label: "Reddit", description: "r/forhire, r/freelance & more" },
  hackernews: { label: "Hacker News", description: "Who's hiring threads" },
  remotive: { label: "Remotive", description: "Remote job board" },
  weworkremotely: { label: "We Work Remotely", description: "Remote jobs board" },
};

const STEPS = [
  { label: "Your niche" },
  { label: "Keywords" },
  { label: "Sources" },
  { label: "Alerts" },
  { label: "Confirm" },
];

const TOTAL_STEPS = 5;

interface SetupWizardProps {
  wizardCompleted: boolean;
  plan: Plan;
}

export function SetupWizard({ wizardCompleted, plan }: SetupWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedNiche, setSelectedNiche] = useState<Niche | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [activePlatforms, setActivePlatforms] = useState<Platform[]>(ALL_PLATFORMS);
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
      await saveWizardSetup({ keywords, activePlatforms, instantAlerts });
    } finally {
      setSaving(false);
    }
  }

  async function handleSkip() {
    setSaving(true);
    try {
      await saveWizardSetup({ keywords: [], activePlatforms: ALL_PLATFORMS, instantAlerts: false });
    } finally {
      setSaving(false);
    }
  }

  const canAdvance = step !== 0 || selectedNiche !== null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .lp-wiz { font-family: 'Space Grotesk', sans-serif; }
        .lp-mono { font-family: 'JetBrains Mono', monospace; }

        @keyframes lp-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lp-tag-in {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1); }
        }

        .lp-step-content { animation: lp-in 0.22s ease forwards; }
        .lp-tag { animation: lp-tag-in 0.15s ease forwards; }

        .lp-niche-bar {
          position: absolute;
          bottom: 0; left: 0;
          height: 2px;
          background: linear-gradient(90deg, #e8a020, #f5c840);
          transition: width 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .lp-input:focus { border-color: rgba(232,160,32,0.4) !important; outline: none; }

        .lp-btn-primary {
          background: linear-gradient(135deg, #e8a020 0%, #d4900a 100%);
          color: #08080f;
          font-weight: 600;
          transition: opacity 0.15s, transform 0.1s;
        }
        .lp-btn-primary:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .lp-btn-primary:disabled { background: #1a1a2c; color: #3a3a52; cursor: not-allowed; transform: none; }

        .lp-btn-ghost {
          border: 1px solid #1e1e30;
          color: #5a5a72;
          background: transparent;
          transition: border-color 0.15s, color 0.15s;
        }
        .lp-btn-ghost:hover:not(:disabled) { border-color: #2e2e44; color: #8a8a9e; }

        .lp-source-toggle {
          transition: border-color 0.15s, background 0.15s, opacity 0.15s;
        }
        .lp-source-toggle:hover { border-color: #2a2a3e !important; }
      `}</style>

      <div
        className="lp-wiz fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: "radial-gradient(ellipse 90% 60% at 50% 0%, rgba(232,160,32,0.07) 0%, rgba(6,6,12,0.96) 55%)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          className="relative w-full flex rounded-2xl overflow-hidden"
          style={{
            maxWidth: "760px",
            minHeight: "520px",
            border: "1px solid #1a1a2c",
            background: "#07070f",
            boxShadow:
              "0 0 0 1px rgba(232,160,32,0.06), 0 40px 100px rgba(0,0,0,0.85), 0 0 150px rgba(232,160,32,0.03)",
          }}
        >
          {/* ── Left sidebar ─────────────────────────────────────────────── */}
          <div
            className="flex flex-col py-8 px-6 shrink-0"
            style={{
              width: "210px",
              background: "linear-gradient(180deg, #0b0b18 0%, #07070f 100%)",
              borderRight: "1px solid #12121e",
            }}
          >
            {/* Logo */}
            <div className="mb-10">
              <div
                className="lp-mono text-xs uppercase tracking-widest"
                style={{ color: "#e8a020", letterSpacing: "0.18em" }}
              >
                LeadPulse
              </div>
              <div className="text-xs mt-0.5" style={{ color: "#2e2e42" }}>
                Quick setup
              </div>
            </div>

            {/* Step list */}
            <div className="flex flex-col flex-1">
              {STEPS.map((s, i) => {
                const isDone = i < step;
                const isActive = i === step;
                return (
                  <div key={i} className="flex items-start gap-3">
                    {/* Indicator column */}
                    <div className="flex flex-col items-center">
                      <div
                        className="flex items-center justify-center rounded-full shrink-0"
                        style={{
                          width: "22px",
                          height: "22px",
                          background: isActive
                            ? "#e8a020"
                            : isDone
                            ? "rgba(232,160,32,0.15)"
                            : "#10101c",
                          border: `1.5px solid ${
                            isActive
                              ? "#e8a020"
                              : isDone
                              ? "rgba(232,160,32,0.4)"
                              : "#1c1c2a"
                          }`,
                          zIndex: 1,
                        }}
                      >
                        {isDone ? (
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                            <path
                              d="M1.5 4.5l2 2L7.5 2"
                              stroke="#e8a020"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <span
                            className="lp-mono"
                            style={{
                              fontSize: "9px",
                              fontWeight: 600,
                              color: isActive ? "#07070f" : "#2e2e42",
                            }}
                          >
                            {i + 1}
                          </span>
                        )}
                      </div>
                      {i < TOTAL_STEPS - 1 && (
                        <div
                          style={{
                            width: "1px",
                            height: "30px",
                            background: isDone
                              ? "linear-gradient(to bottom, rgba(232,160,32,0.4), rgba(232,160,32,0.1))"
                              : "#141420",
                          }}
                        />
                      )}
                    </div>

                    {/* Label */}
                    <div style={{ paddingTop: "3px", paddingBottom: i < TOTAL_STEPS - 1 ? "0" : "0" }}>
                      <p
                        className="text-xs"
                        style={{
                          color: isActive ? "#f0f0f8" : isDone ? "rgba(232,160,32,0.6)" : "#2e2e42",
                          fontWeight: isActive ? 600 : 400,
                          marginBottom: i < TOTAL_STEPS - 1 ? "18px" : "0",
                        }}
                      >
                        {s.label}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Skip */}
            <button
              onClick={handleSkip}
              disabled={saving}
              className="text-xs text-left mt-4 transition"
              style={{ color: "#2e2e42" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#5a5a72")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#2e2e42")}
            >
              Skip setup →
            </button>
          </div>

          {/* ── Right content ─────────────────────────────────────────────── */}
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex-1 px-8 py-8 overflow-y-auto" style={{ minHeight: "400px" }}>
              <div key={step} className="lp-step-content">
                {step === 0 && <StepNiche selected={selectedNiche} onPick={pickNiche} />}
                {step === 1 && (
                  <StepKeywords
                    keywords={keywords}
                    input={keywordInput}
                    onInputChange={setKeywordInput}
                    onAdd={addKeyword}
                    onRemove={removeKeyword}
                  />
                )}
                {step === 2 && <StepSources active={activePlatforms} onToggle={togglePlatform} />}
                {step === 3 && (
                  <StepAlerts value={instantAlerts} onChange={setInstantAlerts} plan={plan} />
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
            </div>

            {/* Footer */}
            <div
              className="px-8 py-5 flex items-center justify-between"
              style={{ borderTop: "1px solid #10101c" }}
            >
              {/* Progress bar */}
              <div className="flex items-center gap-2.5">
                <div
                  className="rounded-full overflow-hidden"
                  style={{ width: "72px", height: "3px", background: "#12121e" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${((step + 1) / TOTAL_STEPS) * 100}%`,
                      background: "linear-gradient(90deg, #e8a020, #f5c840)",
                      transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  />
                </div>
                <span
                  className="lp-mono"
                  style={{ fontSize: "11px", color: "#2e2e42" }}
                >
                  {step + 1}/{TOTAL_STEPS}
                </span>
              </div>

              <div className="flex gap-2">
                {step > 0 && (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    disabled={saving}
                    className="lp-btn-ghost rounded-lg px-4 py-2 text-sm"
                  >
                    Back
                  </button>
                )}
                {step < TOTAL_STEPS - 1 ? (
                  <button
                    onClick={() => setStep((s) => s + 1)}
                    disabled={!canAdvance}
                    className="lp-btn-primary rounded-lg px-5 py-2 text-sm"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    disabled={saving}
                    className="lp-btn-primary rounded-lg px-5 py-2 text-sm flex items-center gap-2"
                  >
                    {saving && (
                      <span
                        className="rounded-full border-2 animate-spin"
                        style={{
                          width: "13px",
                          height: "13px",
                          borderColor: "rgba(8,8,15,0.3)",
                          borderTopColor: "#08080f",
                        }}
                      />
                    )}
                    {saving ? "Saving…" : "Start finding leads →"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Step: Niche ─────────────────────────────────────────────────────────────

function StepNiche({
  selected,
  onPick,
}: {
  selected: Niche | null;
  onPick: (n: Niche) => void;
}) {
  return (
    <div>
      <h2
        className="font-bold mb-1.5"
        style={{ fontSize: "21px", color: "#f0f0f8", letterSpacing: "-0.025em" }}
      >
        What&apos;s your craft?
      </h2>
      <p className="text-sm mb-6" style={{ color: "#4a4a62" }}>
        We&apos;ll pre-load the sharpest keywords for your niche.
      </p>

      <div className="grid grid-cols-1 gap-2">
        {(Object.keys(NICHE_LABELS) as Niche[]).map((niche) => {
          const { label, emoji, description } = NICHE_LABELS[niche];
          const isSelected = selected === niche;
          return (
            <button
              key={niche}
              onClick={() => onPick(niche)}
              className="flex items-center gap-4 rounded-xl text-left transition-all"
              style={{
                padding: "11px 14px",
                border: `1px solid ${isSelected ? "rgba(232,160,32,0.45)" : "#161622"}`,
                background: isSelected
                  ? "linear-gradient(135deg, rgba(232,160,32,0.08), rgba(232,160,32,0.03))"
                  : "#0c0c18",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Signal sweep bar */}
              <div
                className="lp-niche-bar"
                style={{ width: isSelected ? "100%" : "0%" }}
              />

              <span style={{ fontSize: "20px", lineHeight: 1 }}>{emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: "#f0f0f8" }}>
                  {label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#4a4a62" }}>
                  {description}
                </p>
              </div>
              {isSelected && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="shrink-0"
                >
                  <circle cx="8" cy="8" r="7" stroke="#e8a020" strokeWidth="1.5" />
                  <path
                    d="M4.5 8l2.5 2.5 4.5-5"
                    stroke="#e8a020"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step: Keywords ───────────────────────────────────────────────────────────

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
      <h2
        className="font-bold mb-1.5"
        style={{ fontSize: "21px", color: "#f0f0f8", letterSpacing: "-0.025em" }}
      >
        Tune your signals
      </h2>
      <p className="text-sm mb-6" style={{ color: "#4a4a62" }}>
        LeadPulse watches for these phrases across every source.
      </p>

      <div className="flex gap-2 mb-3">
        <input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAdd()}
          placeholder="Add a keyword…"
          className="lp-mono lp-input flex-1 rounded-lg text-sm transition"
          style={{
            padding: "9px 13px",
            border: "1px solid #161622",
            background: "#0a0a14",
            color: "#f0f0f8",
            fontSize: "13px",
          }}
        />
        <button
          onClick={onAdd}
          className="lp-btn-primary rounded-lg text-sm px-4"
          style={{ padding: "9px 16px" }}
        >
          Add
        </button>
      </div>

      <div
        className="rounded-xl p-3 flex flex-wrap gap-2 overflow-y-auto"
        style={{
          minHeight: "90px",
          maxHeight: "190px",
          background: "#0a0a14",
          border: "1px solid #161622",
        }}
      >
        {keywords.length === 0 && (
          <p
            className="lp-mono text-xs self-center w-full text-center"
            style={{ color: "#222230" }}
          >
            no keywords yet
          </p>
        )}
        {keywords.map((kw) => (
          <span
            key={kw}
            className="lp-tag lp-mono inline-flex items-center gap-1.5 rounded-full text-xs"
            style={{
              padding: "4px 10px 4px 12px",
              background: "rgba(232,160,32,0.08)",
              border: "1px solid rgba(232,160,32,0.25)",
              color: "#e8c060",
            }}
          >
            {kw}
            <button
              onClick={() => onRemove(kw)}
              className="transition leading-none"
              style={{ color: "rgba(232,160,32,0.5)", fontSize: "14px" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "#e8a020")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.color = "rgba(232,160,32,0.5)")
              }
            >
              ×
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Step: Sources ────────────────────────────────────────────────────────────

function StepSources({
  active,
  onToggle,
}: {
  active: Platform[];
  onToggle: (p: Platform) => void;
}) {
  return (
    <div>
      <h2
        className="font-bold mb-1.5"
        style={{ fontSize: "21px", color: "#f0f0f8", letterSpacing: "-0.025em" }}
      >
        Choose your sources
      </h2>
      <p className="text-sm mb-6" style={{ color: "#4a4a62" }}>
        All sources are on by default. Toggle any you don&apos;t need.
      </p>

      <div className="space-y-2">
        {ALL_PLATFORMS.map((p) => {
          const { label, description } = PLATFORM_META[p];
          const on = active.includes(p);
          return (
            <button
              key={p}
              onClick={() => onToggle(p)}
              className="lp-source-toggle w-full flex items-center justify-between gap-3 rounded-xl text-left"
              style={{
                padding: "11px 14px",
                border: `1px solid ${on ? "rgba(232,160,32,0.35)" : "#161622"}`,
                background: on ? "rgba(232,160,32,0.05)" : "#0c0c18",
                opacity: on ? 1 : 0.45,
              }}
            >
              <div>
                <p className="font-semibold text-sm" style={{ color: "#f0f0f8" }}>
                  {label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#4a4a62" }}>
                  {description}
                </p>
              </div>
              {/* Toggle pill */}
              <div
                className="relative shrink-0 rounded-full"
                style={{
                  width: "34px",
                  height: "19px",
                  background: on
                    ? "linear-gradient(90deg, #e8a020, #d4900a)"
                    : "#1a1a2c",
                  transition: "background 0.2s",
                }}
              >
                <span
                  className="absolute rounded-full bg-white"
                  style={{
                    width: "13px",
                    height: "13px",
                    top: "3px",
                    left: on ? "18px" : "3px",
                    transition: "left 0.18s ease",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step: Alerts ─────────────────────────────────────────────────────────────

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
      <h2
        className="font-bold mb-1.5"
        style={{ fontSize: "21px", color: "#f0f0f8", letterSpacing: "-0.025em" }}
      >
        Alert cadence
      </h2>
      <p className="text-sm mb-6" style={{ color: "#4a4a62" }}>
        When should LeadPulse ping you about new leads?
      </p>

      <div className="space-y-3">
        {[
          {
            val: false,
            label: "Daily digest",
            description: "A curated morning summary of new leads",
            badge: null,
            locked: false,
          },
          {
            val: true,
            label: "Instant alerts",
            description: "Notified the moment a lead arrives via Slack",
            badge: "Pro+",
            locked: !canInstant,
          },
        ].map(({ val, label, description, badge, locked }) => {
          const isSelected = value === val;
          return (
            <button
              key={String(val)}
              onClick={() => !locked && onChange(val)}
              disabled={locked}
              className="w-full flex items-start gap-4 rounded-xl text-left transition-all"
              style={{
                padding: "13px 14px",
                border: `1px solid ${
                  locked ? "#101018" : isSelected ? "rgba(232,160,32,0.45)" : "#161622"
                }`,
                background: locked
                  ? "#09090f"
                  : isSelected
                  ? "rgba(232,160,32,0.06)"
                  : "#0c0c18",
                opacity: locked ? 0.35 : 1,
                cursor: locked ? "not-allowed" : "pointer",
              }}
            >
              {/* Radio dot */}
              <div
                className="shrink-0 rounded-full border flex items-center justify-center mt-0.5"
                style={{
                  width: "17px",
                  height: "17px",
                  borderColor:
                    isSelected && !locked ? "#e8a020" : "#242432",
                  background:
                    isSelected && !locked ? "#e8a020" : "transparent",
                  transition: "background 0.15s, border-color 0.15s",
                }}
              >
                {isSelected && !locked && (
                  <div
                    className="rounded-full"
                    style={{ width: "5px", height: "5px", background: "#07070f" }}
                  />
                )}
              </div>

              <div className="flex-1">
                <p
                  className="font-semibold text-sm flex items-center gap-2"
                  style={{ color: "#f0f0f8" }}
                >
                  {label}
                  {badge && (
                    <span
                      className="lp-mono rounded-full"
                      style={{
                        fontSize: "10px",
                        padding: "2px 8px",
                        background: "rgba(232,160,32,0.12)",
                        color: "#e8a020",
                      }}
                    >
                      {badge}
                    </span>
                  )}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#4a4a62" }}>
                  {description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step: Confirm ────────────────────────────────────────────────────────────

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
      <div
        className="inline-flex items-center justify-center rounded-xl mb-4"
        style={{
          width: "40px",
          height: "40px",
          background: "rgba(232,160,32,0.1)",
          border: "1px solid rgba(232,160,32,0.2)",
          fontSize: "18px",
        }}
      >
        🎯
      </div>
      <h2
        className="font-bold mb-1.5"
        style={{ fontSize: "21px", color: "#f0f0f8", letterSpacing: "-0.025em" }}
      >
        Ready to hunt
      </h2>
      <p className="text-sm mb-6" style={{ color: "#4a4a62" }}>
        Your setup is locked in. Hit the button to activate.
      </p>

      <div className="space-y-2">
        {[
          {
            label: "Niche",
            value: niche ? NICHE_LABELS[niche].label : "None selected",
          },
          {
            label: "Keywords",
            value:
              keywords.length > 0
                ? `${keywords.length} keyword${keywords.length !== 1 ? "s" : ""}`
                : "None",
          },
          {
            label: "Sources",
            value:
              platforms.length > 0
                ? platforms.map((p) => PLATFORM_META[p].label).join(", ")
                : "None",
          },
          {
            label: "Alerts",
            value: instantAlerts ? "Instant (Slack)" : "Daily digest",
          },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-lg"
            style={{
              padding: "10px 13px",
              border: "1px solid #161622",
              background: "#0a0a14",
            }}
          >
            <span
              className="lp-mono uppercase tracking-wider"
              style={{ fontSize: "10px", color: "#2e2e42" }}
            >
              {label}
            </span>
            <span className="text-sm font-medium" style={{ color: "#f0f0f8" }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
