"use client";

import { Suspense, useState } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import {
  getKeywordLimit,
  hasInstantAlerts,
  hasSlack,
  type Plan,
} from "@/lib/plan-limits";
import { NICHE_PACKS, NICHE_LABELS, type Niche } from "@/lib/niche-packs";
import type { Id } from "@/convex/_generated/dataModel";

const PLAN_LABELS: Record<Plan, { label: string; color: string }> = {
  free: { label: "Free", color: "bg-[#2a2a3e] text-[#8b8b9e]" },
  solo: { label: "Solo", color: "bg-blue-500/15 text-blue-400" },
  pro: { label: "Pro", color: "bg-indigo-500/15 text-indigo-400" },
  agency: { label: "Agency", color: "bg-purple-500/15 text-purple-400" },
};

const SOURCE_META: Record<
  string,
  { label: string; description: string; icon: string }
> = {
  reddit: {
    label: "Reddit",
    description: "Freelance & hiring posts across relevant subreddits",
    icon: "R",
  },
  hackernews: {
    label: "Hacker News",
    description: "\"Who is hiring\" and \"Who wants to be hired\" threads",
    icon: "Y",
  },
  remotive: {
    label: "Remotive",
    description: "Remote job board with freelance & contract roles",
    icon: "Rm",
  },
  weworkremotely: {
    label: "We Work Remotely",
    description: "Remote positions across design, dev, and business",
    icon: "W",
  },
};

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Vancouver",
  "America/Toronto",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Stockholm",
  "Europe/Moscow",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Pacific/Auckland",
];

type TabId = "keywords" | "sources" | "alerts" | "account";

const TABS: { id: TabId; label: string }[] = [
  { id: "keywords", label: "Keywords" },
  { id: "sources", label: "Sources" },
  { id: "alerts", label: "Alerts" },
  { id: "account", label: "Account" },
];

// ─── Settings content (needs Suspense for useSearchParams) ────────────────────

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = (searchParams.get("tab") ?? "keywords") as TabId;
  const { isAuthenticated, isLoading } = useConvexAuth();
  const userRecord = useQuery(api.users.getCurrentUser);
  const userId = userRecord?._id ?? ("" as Id<"users">);

  if (!isLoading && !isAuthenticated) {
    router.push("/sign-in");
    return null;
  }

  const plan: Plan = userRecord?.plan ?? "free";
  const planMeta = PLAN_LABELS[plan];

  function setTab(t: TabId) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", t);
    router.push(`/settings?${params.toString()}`);
  }

  return (
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Sidebar */}
      <aside className="flex flex-col w-60 border-r border-[#1e1e2e] bg-[#0d0d14]">
        <div className="flex items-center px-4 py-4 border-b border-[#1e1e2e]">
          <span className="text-base font-bold text-white tracking-tight">
            LeadPulse
          </span>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-2">
          <NavItem icon={<GridIcon />} label="Dashboard" href="/dashboard" />
          <NavItem
            icon={<SettingsIcon />}
            label="Settings"
            href="/settings"
            active
          />
          <NavItem
            icon={<CreditCardIcon />}
            label="Billing"
            href="/billing"
          />
        </nav>
        <div className="border-t border-[#1e1e2e] p-4">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${planMeta.color}`}
          >
            {planMeta.label} plan
          </span>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-10 border-b border-[#1e1e2e] bg-[#0a0a0f]/90 backdrop-blur px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-white">Settings</h1>
            <span className="text-xs text-[#4a4a5e]">
              {userRecord?.email}
            </span>
          </div>
        </div>

        <div className="px-6 py-6 max-w-2xl mx-auto">
          {/* Tab bar */}
          <div className="flex border-b border-[#1e1e2e] mb-8">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-sm font-medium transition border-b-2 -mb-px ${
                  tab === t.id
                    ? "border-indigo-500 text-white"
                    : "border-transparent text-[#6b6b7e] hover:text-[#8b8b9e]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {userId && userRecord !== undefined && (
            <>
              {tab === "keywords" && (
                <KeywordsTab plan={plan} />
              )}
              {tab === "sources" && (
                <SourcesTab />
              )}
              {tab === "alerts" && (
                <AlertsTab
                  plan={plan}
                  instantAlerts={userRecord?.instantAlerts ?? false}
                  timezone={userRecord?.timezone ?? "UTC"}
                  slackWebhook={userRecord?.slackWebhook ?? ""}
                />
              )}
              {tab === "account" && (
                <AccountTab
                  plan={plan}
                  email={userRecord?.email ?? ""}
                />
              )}
            </>
          )}

          {(!userId || userRecord === undefined) && (
            <div className="flex justify-center py-24">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Keywords Tab ─────────────────────────────────────────────────────────────

function KeywordsTab({ plan }: { plan: Plan }) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loadingPack, setLoadingPack] = useState(false);

  const keywords = useQuery(api.keywords.listKeywords, {});
  const addKeyword = useMutation(api.keywords.addKeyword);
  const deleteKeyword = useMutation(api.keywords.deleteKeyword);
  const toggleKeyword = useMutation(api.keywords.toggleKeyword);

  const limit = getKeywordLimit(plan);
  const count = keywords?.length ?? 0;
  const atLimit = isFinite(limit) && count >= limit;

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const term = input.trim();
    if (!term) return;
    setError("");
    try {
      await addKeyword({ term });
      setInput("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add keyword");
    }
  }

  async function handleLoadPack(niche: Niche) {
    setLoadingPack(true);
    setError("");
    const terms = NICHE_PACKS[niche];
    for (const term of terms) {
      try {
        await addKeyword({ term });
      } catch {
        // Skip if already at limit
      }
    }
    setLoadingPack(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-white">Keywords</h2>
          <p className="text-sm text-[#6b6b7e] mt-0.5">
            LeadPulse monitors these terms across all active sources.
          </p>
        </div>
        <span className="text-sm font-medium text-[#6b6b7e]">
          {count}
          {isFinite(limit) ? ` / ${limit}` : ""} keyword
          {count !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. need a developer"
          disabled={atLimit}
          className="flex-1 bg-[#13131a] border border-[#2a2a3e] rounded-lg px-3 py-2 text-sm text-white placeholder-[#4a4a5e] focus:outline-none focus:border-indigo-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={atLimit || !input.trim()}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition"
        >
          Add
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}

      {atLimit && (
        <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">
          <LockIcon />
          Keyword limit reached.{" "}
          <Link href="/billing" className="underline hover:no-underline">
            Upgrade to add more
          </Link>
        </div>
      )}

      {/* Load niche pack */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#6b6b7e]">Load niche pack:</span>
        <select
          disabled={loadingPack || atLimit}
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) handleLoadPack(e.target.value as Niche);
            e.target.value = "";
          }}
          className="bg-[#13131a] border border-[#2a2a3e] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
        >
          <option value="" disabled>
            Select a niche…
          </option>
          {(Object.keys(NICHE_LABELS) as Niche[]).map((niche) => (
            <option key={niche} value={niche}>
              {NICHE_LABELS[niche].emoji} {NICHE_LABELS[niche].label} —{" "}
              {NICHE_PACKS[niche].length} keywords
            </option>
          ))}
        </select>
        {loadingPack && (
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      {/* Keyword chips */}
      {keywords && keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.map((kw) => (
            <div
              key={kw._id}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition ${
                kw.isActive
                  ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-300"
                  : "bg-[#13131a] border-[#2a2a3e] text-[#4a4a5e]"
              }`}
            >
              <button
                onClick={() =>
                  toggleKeyword({ keywordId: kw._id })
                }
                title={kw.isActive ? "Deactivate" : "Activate"}
                className="hover:opacity-70 transition"
              >
                {kw.term}
              </button>
              <button
                onClick={() =>
                  deleteKeyword({ keywordId: kw._id })
                }
                title="Remove"
                className="text-[#4a4a5e] hover:text-red-400 transition ml-0.5"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {keywords?.length === 0 && (
        <p className="text-sm text-[#4a4a5e] py-4 text-center">
          No keywords yet. Add one above to start surfacing leads.
        </p>
      )}
    </div>
  );
}

// ─── Sources Tab ──────────────────────────────────────────────────────────────

function SourcesTab() {
  const sources = useQuery(api.sources.getSources, {});
  const toggleSource = useMutation(api.sources.toggleSource);
  const initSources = useMutation(api.sources.initDefaultSources);

  // Auto-init if user has no sources
  const hasInit =
    sources !== undefined && sources.length > 0;

  if (sources !== undefined && sources.length === 0) {
    initSources({}).catch(() => {});
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-white">Sources</h2>
        <p className="text-sm text-[#6b6b7e] mt-0.5">
          Choose which platforms LeadPulse monitors for your keywords.
        </p>
      </div>

      <div className="space-y-3">
        {(["reddit", "hackernews", "remotive", "weworkremotely"] as const).map(
          (platform) => {
            const source = sources?.find((s) => s.platform === platform);
            const meta = SOURCE_META[platform];

            return (
              <div
                key={platform}
                className="flex items-center justify-between rounded-xl border border-[#1e1e2e] bg-[#13131a] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2a2a3e] flex items-center justify-center text-xs font-bold text-[#8b8b9e]">
                    {meta.icon}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">
                      {meta.label}
                    </div>
                    <div className="text-xs text-[#4a4a5e] mt-0.5">
                      {meta.description}
                    </div>
                  </div>
                </div>
                <Toggle
                  enabled={source?.isActive ?? false}
                  disabled={!source}
                  onChange={() => {
                    if (source) {
                      toggleSource({ sourceId: source._id });
                    }
                  }}
                />
              </div>
            );
          }
        )}
      </div>

      {!hasInit && (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}

// ─── Alerts Tab ───────────────────────────────────────────────────────────────

function AlertsTab({
  plan,
  instantAlerts,
  timezone,
  slackWebhook,
}: {
  plan: Plan;
  instantAlerts: boolean;
  timezone: string;
  slackWebhook: string;
}) {
  const [webhookInput, setWebhookInput] = useState(slackWebhook);
  const [testStatus, setTestStatus] = useState<
    "idle" | "loading" | "ok" | "error"
  >("idle");
  const [testError, setTestError] = useState("");

  const updateSettings = useMutation(api.users.updateUserSettings);
  const testWebhook = useAction(api.slack.testSlackWebhook);

  const canInstant = hasInstantAlerts(plan);
  const canSlack = hasSlack(plan);

  async function handleTestWebhook() {
    setTestStatus("loading");
    setTestError("");
    try {
      await testWebhook({});
      setTestStatus("ok");
    } catch (err: unknown) {
      setTestError(
        err instanceof Error ? err.message : "Test failed"
      );
      setTestStatus("error");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-semibold text-white">Alerts</h2>
        <p className="text-sm text-[#6b6b7e] mt-0.5">
          Control how and when you receive lead notifications.
        </p>
      </div>

      {/* Alert frequency */}
      <Section title="Alert frequency">
        <div className="flex items-center justify-between rounded-xl border border-[#1e1e2e] bg-[#13131a] px-4 py-3">
          <div>
            <div className="text-sm font-medium text-white">Instant alerts</div>
            <div className="text-xs text-[#4a4a5e] mt-0.5">
              Get notified immediately when a new lead appears
            </div>
          </div>
          {canInstant ? (
            <Toggle
              enabled={instantAlerts}
              onChange={() =>
                updateSettings({
                  instantAlerts: !instantAlerts,
                })
              }
            />
          ) : (
            <GateBadge plan="pro" />
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[#1e1e2e] bg-[#13131a] px-4 py-3">
          <div>
            <div className="text-sm font-medium text-white">Daily digest</div>
            <div className="text-xs text-[#4a4a5e] mt-0.5">
              Summary email delivered once per day
            </div>
          </div>
          <span className="text-xs text-[#6b6b7e] bg-[#2a2a3e] rounded-full px-2.5 py-0.5">
            Always on
          </span>
        </div>
      </Section>

      {/* Timezone */}
      <Section title="Timezone">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#6b6b7e]">
            Affects when your daily digest is delivered.
          </p>
          <select
            value={timezone}
            onChange={(e) =>
              updateSettings({ timezone: e.target.value })
            }
            className="bg-[#13131a] border border-[#2a2a3e] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </Section>

      {/* Slack */}
      <Section
        title={
          <span className="flex items-center gap-2">
            Slack webhook
            {!canSlack && <LockIcon />}
          </span>
        }
      >
        <p className="text-sm text-[#6b6b7e] mb-3">
          Post lead alerts directly to a Slack channel.
          {!canSlack && (
            <span className="ml-1 text-amber-400">
              Available on Solo and above.{" "}
              <Link href="/billing" className="underline hover:no-underline">
                Upgrade
              </Link>
            </span>
          )}
        </p>
        <div className="flex gap-2">
          <input
            value={webhookInput}
            onChange={(e) => setWebhookInput(e.target.value)}
            onBlur={() =>
              updateSettings({ slackWebhook: webhookInput })
            }
            disabled={!canSlack}
            placeholder="https://hooks.slack.com/services/…"
            className="flex-1 bg-[#13131a] border border-[#2a2a3e] rounded-lg px-3 py-2 text-sm text-white placeholder-[#4a4a5e] focus:outline-none focus:border-indigo-500 disabled:opacity-40"
          />
          <button
            disabled={!canSlack || !webhookInput.trim() || testStatus === "loading"}
            onClick={handleTestWebhook}
            className="px-3 py-2 border border-[#2a2a3e] rounded-lg text-sm text-[#8b8b9e] hover:text-white hover:border-[#4a4a5e] disabled:opacity-40 transition whitespace-nowrap"
          >
            {testStatus === "loading" ? "Testing…" : "Test webhook"}
          </button>
        </div>
        {testStatus === "ok" && (
          <p className="text-sm text-emerald-400 mt-2">
            ✓ Test message sent successfully.
          </p>
        )}
        {testStatus === "error" && (
          <p className="text-sm text-red-400 mt-2">{testError}</p>
        )}
      </Section>
    </div>
  );
}

// ─── Account Tab ──────────────────────────────────────────────────────────────

function AccountTab({
  plan,
  email,
}: {
  plan: Plan;
  email: string;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();
  const { signOut } = useAuthActions();
  const resetOnboarding = useMutation(api.users.resetOnboarding);
  const deleteAccount = useMutation(api.users.deleteAccount);

  const planMeta = PLAN_LABELS[plan];

  async function handleDelete() {
    if (deleteConfirm !== "DELETE") return;
    setDeleting(true);
    try {
      await deleteAccount({});
      await signOut();
      router.push("/sign-in");
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-semibold text-white">Account</h2>
        <p className="text-sm text-[#6b6b7e] mt-0.5">
          Manage your plan and account settings.
        </p>
      </div>

      {/* Plan */}
      <Section title="Current plan">
        <div className="rounded-xl border border-[#1e1e2e] bg-[#13131a] px-4 py-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${planMeta.color}`}
              >
                {planMeta.label}
              </span>
              <span className="text-sm text-[#6b6b7e]">{email}</span>
            </div>
          </div>
          {plan !== "agency" && (
            <Link
              href="/billing"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition"
            >
              Upgrade
            </Link>
          )}
        </div>
      </Section>

      {/* Onboarding */}
      <Section title="Onboarding">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#6b6b7e]">
            Replay the product tour to rediscover features.
          </p>
          <button
            onClick={() => resetOnboarding({})}
            className="px-3 py-1.5 border border-[#2a2a3e] rounded-lg text-sm text-[#8b8b9e] hover:text-white hover:border-[#4a4a5e] transition"
          >
            Restart tour
          </button>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title={<span className="text-red-400">Danger zone</span>}>
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 px-4 py-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-white">Delete account</div>
            <div className="text-xs text-[#4a4a5e] mt-0.5">
              Permanently delete your account and all data. This cannot be undone.
            </div>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="px-3 py-1.5 border border-red-800/60 rounded-lg text-sm text-red-400 hover:bg-red-900/30 transition"
          >
            Delete
          </button>
        </div>
      </Section>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#13131a] border border-[#2a2a3e] rounded-2xl p-6 w-full max-w-md mx-4 space-y-4">
            <h3 className="text-base font-semibold text-white">
              Delete account
            </h3>
            <p className="text-sm text-[#6b6b7e]">
              This will permanently delete your account, keywords, sources, and
              all leads. This action cannot be undone.
            </p>
            <p className="text-sm text-[#8b8b9e]">
              Type <span className="font-mono text-white">DELETE</span> to
              confirm.
            </p>
            <input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="w-full bg-[#0d0d14] border border-[#2a2a3e] rounded-lg px-3 py-2 text-sm text-white placeholder-[#4a4a5e] focus:outline-none focus:border-red-500 font-mono"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirm("");
                }}
                className="px-4 py-2 border border-[#2a2a3e] rounded-lg text-sm text-[#8b8b9e] hover:text-white transition"
              >
                Cancel
              </button>
              <button
                disabled={deleteConfirm !== "DELETE" || deleting}
                onClick={handleDelete}
                className="px-4 py-2 bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition"
              >
                {deleting ? "Deleting…" : "Delete my account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-[#8b8b9e] uppercase tracking-wider">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Toggle({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${
        enabled ? "bg-indigo-600" : "bg-[#2a2a3e]"
      } disabled:opacity-40`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-4" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function GateBadge({ plan }: { plan: string }) {
  return (
    <Link
      href="/billing"
      className="flex items-center gap-1.5 px-2.5 py-1 bg-[#2a2a3e] rounded-full text-xs text-[#6b6b7e] hover:text-white transition"
    >
      <LockIcon />
      {plan}+
    </Link>
  );
}

function NavItem({
  icon,
  label,
  href,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition ${
        active
          ? "bg-indigo-500/10 text-indigo-400"
          : "text-[#6b6b7e] hover:bg-[#1e1e2e] hover:text-white"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="1.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="1.5" y="9" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="9" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M2.93 2.93l1.06 1.06M12.01 12.01l1.06 1.06M13.07 2.93l-1.06 1.06M3.99 12.01l-1.06 1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 6.5h13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M4 10h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1.5" y="5" width="9" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3.5 5V3.5a2.5 2.5 0 015 0V5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#0a0a0f]">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
