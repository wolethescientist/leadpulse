"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { hasAIReply, type Plan } from "@/lib/plan-limits";
import { LeadCard } from "@/components/LeadCard";
import { SetupWizard } from "@/components/SetupWizard";
import { OnboardingTour } from "@/components/OnboardingTour";
import { FeatureSpotlight } from "@/components/FeatureSpotlight";
import { NPSPopup } from "@/components/NPSPopup";
import { Doc, Id } from "@/convex/_generated/dataModel";

type Platform = "reddit" | "hackernews" | "remotive" | "weworkremotely";
type StatusFilter = "all" | "new" | "saved" | "archived";
type SourceFilter = "all" | Platform;
type SortBy = "newest" | "score";

type LeadWithPost = Doc<"leads"> & { post: Doc<"rawPosts"> };

const PLAN_LABELS: Record<Plan, { label: string; color: string; dot: string }> = {
  free:   { label: "Free",   color: "bg-white/[0.06] text-[#8888a8]",   dot: "bg-[#8888a8]"   },
  solo:   { label: "Solo",   color: "bg-blue-500/15 text-blue-400",      dot: "bg-blue-400"    },
  pro:    { label: "Pro",    color: "bg-indigo-500/15 text-indigo-400",  dot: "bg-indigo-400"  },
  agency: { label: "Agency", color: "bg-violet-500/15 text-violet-400",  dot: "bg-violet-400"  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const userRecord = useQuery(api.users.getCurrentUser);
  const userId = userRecord?._id ?? ("" as Id<"users">);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("newest");

  const leads = useQuery(api.leads.getLeadsForUser, isAuthenticated ? {} : "skip");
  const stats = useQuery(api.leads.getLeadStats, isAuthenticated ? {} : "skip");

  const plan: Plan = userRecord?.plan ?? "free";
  const canDraftReply = hasAIReply(plan);

  if (!isLoading && !isAuthenticated) {
    router.push("/sign-in");
    return null;
  }

  const now = Date.now();
  const twoHoursAgo = now - 2 * 60 * 60 * 1000;
  const allLeads = (leads ?? []) as LeadWithPost[];

  const hotLeads: LeadWithPost[] = [...allLeads]
    .filter((l) => l.post.postedAt >= twoHoursAgo)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const filteredLeads: LeadWithPost[] = allLeads
    .filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (sourceFilter !== "all" && l.post.platform !== sourceFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "score") return b.score - a.score;
      return b._creationTime - a._creationTime;
    });

  const pageIsLoading = isLoading || leads === undefined || stats === undefined;
  const planMeta = PLAN_LABELS[plan];

  return (
    <>
      {userId && userRecord !== undefined && (
        <>
          <SetupWizard wizardCompleted={userRecord?.wizardCompleted ?? false} plan={plan} />
          <OnboardingTour onboardingCompleted={userRecord?.onboardingCompleted ?? false} />
          <FeatureSpotlight dismissedFlags={userRecord?.dismissedFlags ?? []} />
          <NPSPopup userCreatedAt={userRecord?._creationTime ?? Date.now()} npsScore={userRecord?.npsScore} />
        </>
      )}

      <div className="flex h-screen bg-[#06060b] overflow-hidden">
        {/* ─── Sidebar ──────────────────────────────────────────────────── */}
        <aside
          className="flex flex-col border-r bg-[#0a0a12] transition-all duration-300"
          style={{
            width: sidebarOpen ? "224px" : "56px",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between border-b px-3 py-4"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            {sidebarOpen && (
              <div className="flex items-center gap-2 pl-1">
                <span className="blink-dot h-1.5 w-1.5 rounded-full bg-indigo-400" />
                <span className="text-[15px] font-bold tracking-tight text-white">
                  LeadPulse
                </span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="rounded-lg p-1.5 text-[#52526a] transition-all duration-150 hover:bg-white/[0.05] hover:text-white"
            >
              <MenuIcon />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 space-y-0.5 px-2 py-4">
            <NavItem icon={<GridIcon />}       label="Dashboard" href="/dashboard" active collapsed={!sidebarOpen} />
            <NavItem icon={<SettingsIcon />}   label="Settings"  href="/settings"  collapsed={!sidebarOpen} />
            <NavItem id="tour-billing-link" icon={<CreditCardIcon />} label="Billing" href="/billing" collapsed={!sidebarOpen} />
          </nav>

          {/* Plan badge + stats */}
          <div
            className="border-t p-3 space-y-3"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            {sidebarOpen ? (
              <>
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${planMeta.dot}`} />
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${planMeta.color}`}>
                    {planMeta.label} plan
                  </span>
                </div>

                {stats && (
                  <div id="tour-sidebar-stats" className="space-y-2">
                    <StatRow label="Total leads" value={String(stats.total)} />
                    <StatRow label="New today"   value={String(stats.newToday)} />
                    <StatRow label="Avg score"   value={stats.avgScore > 0 ? String(stats.avgScore) : "—"} />
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-center">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${planMeta.color}`}
                  title={`${planMeta.label} plan`}
                >
                  {planMeta.label[0]}
                </span>
              </div>
            )}
          </div>
        </aside>

        {/* ─── Main ─────────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto">
          {/* Top bar */}
          <div
            className="sticky top-0 z-10 border-b px-6 py-3.5"
            style={{
              borderColor: "rgba(255,255,255,0.05)",
              background: "rgba(6,6,11,0.85)",
              backdropFilter: "blur(16px)",
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-base font-bold text-white">Lead Feed</h1>
                {!pageIsLoading && allLeads.length > 0 && (
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs text-[#8888a8]">
                    {filteredLeads.length}
                  </span>
                )}
              </div>
              <span className="text-xs text-[#303048]">{userRecord?.email}</span>
            </div>
          </div>

          <div className="px-6 py-6 max-w-3xl mx-auto">
            {pageIsLoading ? (
              <div className="flex flex-col items-center justify-center gap-3 py-28">
                <div
                  className="h-8 w-8 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin"
                />
                <span className="text-xs text-[#52526a]">Loading leads…</span>
              </div>
            ) : (
              <>
                {/* Filter bar */}
                <div id="tour-filter-bar">
                  <FilterBar
                    statusFilter={statusFilter}
                    sourceFilter={sourceFilter}
                    sortBy={sortBy}
                    onStatus={setStatusFilter}
                    onSource={setSourceFilter}
                    onSort={setSortBy}
                  />
                </div>

                {/* Hot right now */}
                {hotLeads.length > 0 && statusFilter === "all" && sourceFilter === "all" && (
                  <section className="mb-8">
                    <div className="mb-3 flex items-center gap-2">
                      <FlameIcon />
                      <h2 className="text-sm font-semibold text-amber-400">Hot right now</h2>
                      <span className="text-xs text-[#303048]">Top leads · last 2 hours</span>
                    </div>
                    <div className="space-y-3">
                      {hotLeads.map((lead) => (
                        <LeadCard
                          key={lead._id}
                          lead={lead}
                          plan={plan}
                          canDraftReply={canDraftReply}
                          highlight
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Full feed */}
                <section id="tour-feed">
                  {filteredLeads.length === 0 ? (
                    <EmptyState statusFilter={statusFilter} sourceFilter={sourceFilter} />
                  ) : (
                    <div className="space-y-3">
                      {filteredLeads.map((lead, idx) => (
                        <LeadCard
                          key={lead._id}
                          id={idx === 0 ? "tour-lead-card" : undefined}
                          lead={lead}
                          plan={plan}
                          canDraftReply={canDraftReply}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </main>
      </div>
    </>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function FilterBar({ statusFilter, sourceFilter, sortBy, onStatus, onSource, onSort }: {
  statusFilter: StatusFilter;
  sourceFilter: SourceFilter;
  sortBy: SortBy;
  onStatus: (v: StatusFilter) => void;
  onSource: (v: SourceFilter) => void;
  onSort: (v: SortBy) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 mb-7">
      <FilterGroup<StatusFilter>
        value={statusFilter}
        onChange={onStatus}
        options={[
          { value: "all",      label: "All"      },
          { value: "new",      label: "New"      },
          { value: "saved",    label: "Saved"    },
          { value: "archived", label: "Archived" },
        ]}
      />
      <div className="h-3.5 w-px bg-white/[0.08]" />
      <FilterGroup<SourceFilter>
        value={sourceFilter}
        onChange={onSource}
        options={[
          { value: "all",             label: "All"      },
          { value: "reddit",          label: "Reddit"   },
          { value: "hackernews",      label: "HN"       },
          { value: "remotive",        label: "Remotive" },
          { value: "weworkremotely",  label: "WWR"      },
        ]}
      />
      <div className="h-3.5 w-px bg-white/[0.08]" />
      <FilterGroup<SortBy>
        value={sortBy}
        onChange={onSort}
        options={[
          { value: "newest", label: "Newest"        },
          { value: "score",  label: "Highest score" },
        ]}
      />
    </div>
  );
}

function FilterGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div
      className="flex items-center rounded-lg p-0.5 gap-0.5"
      style={{ border: "1px solid rgba(255,255,255,0.07)", background: "#0a0a12" }}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150"
          style={
            value === opt.value
              ? { background: "rgba(99,102,241,0.85)", color: "#fff", boxShadow: "0 0 10px rgba(99,102,241,0.3)" }
              : { color: "#52526a" }
          }
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function NavItem({ id, icon, label, href, active, collapsed }: {
  id?: string;
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      id={id}
      href={href}
      title={collapsed ? label : undefined}
      className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-all duration-150"
      style={
        active
          ? {
              background: "rgba(99,102,241,0.12)",
              color: "#818cf8",
              boxShadow: "inset 0 0 0 1px rgba(99,102,241,0.15)",
            }
          : { color: "#52526a" }
      }
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
          (e.currentTarget as HTMLElement).style.color = "#eeeef8";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = "";
          (e.currentTarget as HTMLElement).style.color = "#52526a";
        }
      }}
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="font-medium">{label}</span>}
    </Link>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-[#303048]">{label}</span>
      <span className="text-xs font-bold text-[#8888a8]">{value}</span>
    </div>
  );
}

function EmptyState({ statusFilter, sourceFilter }: {
  statusFilter: StatusFilter;
  sourceFilter: SourceFilter;
}) {
  const hasFilter = statusFilter !== "all" || sourceFilter !== "all";
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center">
      <div
        className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}
      >
        <InboxIcon />
      </div>
      <h3 className="mb-2 text-base font-semibold text-white">
        {hasFilter ? "No leads match your filters" : "No leads yet"}
      </h3>
      <p className="text-sm text-[#52526a] max-w-xs leading-relaxed">
        {hasFilter
          ? "Try adjusting your filters to see more results."
          : "LeadPulse will surface new leads as they match your keywords."}
      </p>
    </div>
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

function MenuIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9"   y="1.5" width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="1.5" y="9"   width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9"   y="9"   width="5.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M2.93 2.93l1.06 1.06M12.01 12.01l1.06 1.06M13.07 2.93l-1.06 1.06M3.99 12.01l-1.06 1.06" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="3.5" width="13" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1.5 6.5h13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M4 10h3"    stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" className="text-amber-400">
      <path d="M7 1C7 1 9.5 3.5 9.5 6C9.5 6 8.5 5.5 8 5C8 5 9 7.5 7 9C7 9 7.5 8 7 7.5C7 7.5 5.5 9 5.5 10.5C5.5 12 6.5 13 7 13C7 13 3 12 3 8.5C3 5 7 1 7 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-indigo-500/60">
      <path d="M22 12H16L14 15H10L8 12H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.45 5.11L2 12V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V12L18.55 5.11C18.21 4.43 17.52 4 16.76 4H7.24C6.48 4 5.79 4.43 5.45 5.11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
