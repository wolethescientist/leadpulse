import Link from "next/link";
import { AnimatedLeadCard } from "@/components/landing/AnimatedLeadCard";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQAccordion } from "@/components/landing/FAQAccordion";
import { ScrollReveal } from "@/components/landing/ScrollReveal";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#06060b] text-white antialiased overflow-x-hidden">
      <ScrollReveal />

      {/* ─── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.05] bg-[#06060b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <span className="blink-dot absolute inset-0 m-auto h-2 w-2 rounded-full bg-indigo-500/40 blur-sm" />
              <span className="blink-dot relative h-2 w-2 rounded-full bg-indigo-400 block" />
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white">
              LeadPulse
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-[#8888a8] hover:text-white transition-colors duration-200"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="btn-glow relative rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-indigo-500 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500"
            >
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-5 pb-28 pt-20 lg:pt-32">
        {/* Dot grid */}
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-40" />

        {/* Gradient orbs */}
        <div
          className="glow-pulse glow-orb pointer-events-none absolute left-1/2 top-0 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/3"
          style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.14) 0%, rgba(139,92,246,0.05) 50%, transparent 70%)" }}
        />
        <div
          className="glow-orb pointer-events-none absolute -right-40 top-1/2 h-[400px] w-[400px] -translate-y-1/2"
          style={{ background: "radial-gradient(ellipse, rgba(168,85,247,0.08) 0%, transparent 70%)" }}
        />

        {/* Scan line */}
        <div className="scan-line pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1fr_420px]">
          {/* Left: copy */}
          <div className="flex flex-col gap-8">
            {/* Badge */}
            <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-indigo-500/20 bg-indigo-500/8 px-3.5 py-1.5">
              <div className="relative flex h-1.5 w-1.5 items-center justify-center">
                <span className="pulse-ring absolute h-1.5 w-1.5 rounded-full bg-indigo-400/60" />
                <span className="blink-dot h-1.5 w-1.5 rounded-full bg-indigo-400" />
              </div>
              <span className="text-xs font-medium tracking-wide text-indigo-300">
                Monitoring 4 platforms · 24/7
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.6rem]">
                Clients are posting on Reddit{" "}
                <span className="shimmer-text">right now.</span>
              </h1>
              <h1 className="mt-2 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.6rem]" style={{ color: '#303048' }}>
                You&apos;re not seeing them.
              </h1>
            </div>

            <p className="max-w-lg text-lg leading-relaxed text-[#8888a8]">
              LeadPulse monitors Reddit, HN, and job boards 24/7 and delivers
              pre-scored freelancer leads to your inbox — before anyone else
              replies.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/sign-up"
                className="btn-glow inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-[0_0_0_1px_rgba(99,102,241,0.3)] transition-all duration-200 hover:bg-indigo-500 hover:shadow-[0_0_32px_rgba(99,102,241,0.5)]"
              >
                Start free — no card needed
                <ArrowRightIcon />
              </Link>

              <div className="flex items-center gap-3">
                <AvatarStack />
                <span className="text-sm text-[#52526a]">
                  Join{" "}
                  <span className="font-semibold text-[#8888a8]">400+</span>{" "}
                  freelancers
                </span>
              </div>
            </div>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
              {["No credit card", "7-day free trial", "Cancel anytime"].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckMiniBadge />
                  <span className="text-xs text-[#52526a]">{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: animated lead card */}
          <div className="float lg:pl-4">
            <AnimatedLeadCard />
          </div>
        </div>
      </section>

      {/* ─── Problem ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0a0a12] px-5 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="fade-up mb-16 text-center">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#52526a]">
              The problem
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              The way freelancers find clients is{" "}
              <span className="text-rose-400">broken.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[#8888a8]">
              Manual prospecting is slow, inconsistent, and demoralising.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                num: "01",
                icon: <ClockIcon />,
                title: "You're always the 50th reply",
                body: "By the time you see the post, dozens have already replied. The client moves on before they even read yours.",
              },
              {
                num: "02",
                icon: <EyeOffIcon />,
                title: "Reddit moves at internet speed",
                body: "High-intent posts get buried in hours. You check twice a day. That first 20-minute window is where clients decide.",
              },
              {
                num: "03",
                icon: <FilterIcon />,
                title: "Scrolling subreddits is a second job",
                body: "You spend 45 minutes sifting noise to find one good lead. It's not sustainable. Most freelancers just stop.",
              },
            ].map((card, i) => (
              <div
                key={i}
                className={`card-hover fade-up fade-delay-${i + 1} relative overflow-hidden rounded-2xl border border-rose-500/15 bg-rose-500/[0.04] p-6`}
              >
                {/* Ghost number */}
                <div className="ghost-number absolute -right-4 -top-4 select-none opacity-100">
                  {card.num}
                </div>
                <div className="relative">
                  <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
                    {card.icon}
                  </div>
                  <h3 className="mb-2 text-[15px] font-semibold text-white">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#52526a]">
                    {card.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Solution ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-5 py-28">
        <div
          className="glow-orb pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2"
          style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 65%)" }}
        />
        <div className="relative mx-auto max-w-6xl">
          <div className="fade-up mb-16 text-center">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#52526a]">
              The fix
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              LeadPulse finds them{" "}
              <span className="shimmer-text">before anyone else does.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-[#8888a8]">
              Monitoring that never sleeps, scoring that filters noise, setup in 90 seconds.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              {
                num: "01",
                icon: <RadarIcon />,
                title: "Monitoring 24/7 while you sleep",
                body: "Leads surface within minutes of posting. Not hours. Open your dashboard and the work is already done.",
              },
              {
                num: "02",
                icon: <SparkleIcon />,
                title: "AI scoring tells you what's worth replying",
                body: "Every lead gets a 0–100 intent score with 5 buying signals. Reply to 90+ scores only — your close rate triples.",
              },
              {
                num: "03",
                icon: <BoltIcon />,
                title: "Set up in 90 seconds. No noise.",
                body: "Pick a niche pack — pre-built keywords for your specialty. Turn on your sources. Done. LeadPulse handles the rest.",
              },
            ].map((card, i) => (
              <div
                key={i}
                className={`card-hover fade-up fade-delay-${i + 1} relative overflow-hidden rounded-2xl border border-indigo-500/15 bg-indigo-500/[0.04] p-6`}
              >
                <div className="ghost-number absolute -right-4 -top-4">
                  {card.num}
                </div>
                <div className="relative">
                  <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/12 text-indigo-400 shadow-[0_0_16px_rgba(99,102,241,0.2)]">
                    {card.icon}
                  </div>
                  <h3 className="mb-2 text-[15px] font-semibold text-white">
                    {card.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#8888a8]">
                    {card.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Product demo ─────────────────────────────────────────────────── */}
      <section className="bg-[#0a0a12] px-5 py-28">
        <div className="mx-auto max-w-4xl">
          <div className="fade-up mb-14 text-center">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#52526a]">
              The product
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              See what a $3,200 project looks like{" "}
              <span className="shimmer-text">before anyone else does.</span>
            </h2>
          </div>

          <div className="fade-up relative">
            {/* Browser chrome */}
            <div
              className="overflow-hidden rounded-2xl border border-white/[0.07]"
              style={{
                boxShadow:
                  "0 0 0 1px rgba(99,102,241,0.10), 0 48px 100px rgba(0,0,0,0.7), 0 0 80px rgba(99,102,241,0.05)",
              }}
            >
              {/* Title bar */}
              <div className="flex items-center gap-1.5 border-b border-white/[0.06] bg-[#0e0e18] px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                <div className="mx-4 flex h-5 flex-1 items-center rounded-md bg-[#131320] px-3">
                  <span className="font-mono text-[10px] text-[#303048]">
                    app.leadpulse.io/dashboard
                  </span>
                </div>
              </div>

              {/* Dashboard layout */}
              <div className="flex bg-[#06060b]" style={{ height: "380px" }}>
                {/* Sidebar */}
                <div className="flex w-14 flex-col items-center gap-4 border-r border-white/[0.05] bg-[#0a0a12] py-5">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.2)]" />
                  <div className="h-7 w-7 rounded-lg bg-white/[0.04]" />
                  <div className="h-7 w-7 rounded-lg bg-white/[0.04]" />
                  <div className="mt-auto h-7 w-7 rounded-lg bg-white/[0.04]" />
                </div>

                {/* Main area */}
                <div className="flex-1 overflow-hidden p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#52526a]">Lead Feed</span>
                    <div className="flex gap-1.5">
                      <div className="h-5 w-12 rounded-md bg-white/[0.04]" />
                      <div className="h-5 w-12 rounded-md bg-white/[0.04]" />
                    </div>
                  </div>

                  {/* Highlighted lead */}
                  <div
                    className="relative mb-3 rounded-xl border border-indigo-500/40 bg-[#131320] p-4"
                    style={{ boxShadow: "0 0 28px rgba(99,102,241,0.20), inset 0 1px 0 rgba(255,255,255,0.05)" }}
                  >
                    <div className="absolute -right-2 -top-3 flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-600 px-2.5 py-1 shadow-lg">
                      <span className="text-[10px] font-semibold text-white">← This one</span>
                    </div>
                    <div className="mb-2.5 flex items-center gap-2">
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5 font-mono text-xs font-bold text-emerald-400">
                        94
                      </span>
                      <span className="rounded-full border border-orange-500/20 bg-orange-500/15 px-2 py-0.5 text-xs font-medium text-orange-400">
                        r/forhire
                      </span>
                      <span className="ml-auto font-mono text-[10px] text-[#52526a]">4m ago</span>
                    </div>
                    <p className="mb-2.5 text-xs font-semibold leading-snug text-white">
                      Need a freelance developer to build SaaS admin dashboard — startup, $3,200 budget, start this week
                    </p>
                    <div className="flex gap-1.5">
                      <span className="rounded-full border border-white/[0.07] bg-white/[0.04] px-2 py-0.5 text-[10px] text-[#8888a8]">Budget</span>
                      <span className="rounded-full border border-white/[0.07] bg-white/[0.04] px-2 py-0.5 text-[10px] text-[#8888a8]">Urgent</span>
                      <span className="rounded-full border border-indigo-500/25 bg-indigo-500/10 px-2 py-0.5 text-[10px] text-indigo-400">need a developer</span>
                    </div>
                  </div>

                  <div className="mb-2 rounded-xl border border-white/[0.04] bg-white/[0.02] p-3 opacity-30">
                    <div className="flex gap-2">
                      <div className="h-3 w-8 rounded bg-white/10" />
                      <div className="h-3 w-24 rounded bg-white/10" />
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/[0.02] bg-white/[0.01] p-3 opacity-15">
                    <div className="flex gap-2">
                      <div className="h-3 w-8 rounded bg-white/10" />
                      <div className="h-3 w-32 rounded bg-white/10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              <span className="text-indigo-500">↑</span>
              <p className="text-sm text-[#52526a]">
                <span className="font-semibold text-indigo-400">Posted 4 minutes ago.</span>{" "}
                This is what a $3,200 project looks like before anyone else sees it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-5 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="fade-up mb-16 text-center">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#52526a]">
              Features
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Everything you need to land clients{" "}
              <span className="shimmer-text">consistently.</span>
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: <RadarIcon />,
                title: "Multi-source monitoring",
                body: "Reddit, Hacker News, Remotive, and We Work Remotely — all checked every hour, automatically.",
                stat: "4 sources",
                color: "indigo",
              },
              {
                icon: <SparkleIcon />,
                title: "AI intent scoring",
                body: "0–100 score per lead based on 5 buying signals. Stop reading posts that will never convert.",
                stat: "5 signals",
                color: "violet",
              },
              {
                icon: <BellIcon />,
                title: "Instant alerts",
                body: "Slack and email the moment a high-score lead arrives. Reply before anyone else.",
                stat: "< 5 min",
                color: "emerald",
              },
              {
                icon: <PackageIcon />,
                title: "Niche packs",
                body: "Pre-built keyword sets for designers, devs, copywriters, SEO, and video. Live in 90s.",
                stat: "5 niches",
                color: "amber",
              },
            ].map((f, i) => (
              <div
                key={i}
                className={`card-hover fade-up fade-delay-${i + 1} flex flex-col gap-4 rounded-2xl border border-white/[0.07] bg-[#0e0e18] p-6`}
              >
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${
                  f.color === 'indigo' ? 'bg-indigo-500/12 text-indigo-400 shadow-[0_0_16px_rgba(99,102,241,0.18)]' :
                  f.color === 'violet' ? 'bg-violet-500/12 text-violet-400 shadow-[0_0_16px_rgba(139,92,246,0.18)]' :
                  f.color === 'emerald' ? 'bg-emerald-500/12 text-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.18)]' :
                  'bg-amber-500/12 text-amber-400 shadow-[0_0_16px_rgba(251,191,36,0.18)]'
                }`}>
                  {f.icon}
                </div>
                <div className="flex-1">
                  <div className="mb-1.5 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                    <span className={`font-mono text-xs font-bold ${
                      f.color === 'indigo' ? 'text-indigo-400' :
                      f.color === 'violet' ? 'text-violet-400' :
                      f.color === 'emerald' ? 'text-emerald-400' :
                      'text-amber-400'
                    }`}>{f.stat}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#52526a]">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Social proof ─────────────────────────────────────────────────── */}
      <section className="bg-[#0a0a12] px-5 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="fade-up mb-6 text-center">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#52526a]">
              Social proof
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              400+ freelancers.{" "}
              <span className="shimmer-text">Real results.</span>
            </h2>
          </div>

          {/* Stats strip */}
          <div className="fade-up mb-14 mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] md:grid-cols-4">
            {[
              { num: "12,400+", label: "leads scraped last week" },
              { num: "94",      label: "avg score, Pro users"    },
              { num: "3.2×",    label: "higher reply rate vs manual" },
              { num: "< 5 min", label: "avg time to first lead"  },
            ].map((s) => (
              <div key={s.label} className="bg-[#0a0a12] px-8 py-7 text-center">
                <div className="font-mono text-2xl font-bold text-white">{s.num}</div>
                <div className="mt-1 text-xs text-[#52526a]">{s.label}</div>
              </div>
            ))}
          </div>

          <TestimonialsSection />
        </div>
      </section>

      {/* ─── Pricing ──────────────────────────────────────────────────────── */}
      <section className="px-5 py-28">
        <div className="mx-auto max-w-6xl">
          <div className="fade-up mb-16 text-center">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#52526a]">
              Pricing
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Start free.{" "}
              <span className="shimmer-text">Upgrade when it clicks.</span>
            </h2>
            <p className="mt-4 text-[#52526a]">
              7-day free trial · No credit card · Cancel anytime
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                desc: "Get started, no card needed",
                features: ["3 keywords", "10 leads / month", "Daily digest email", "Reddit + HN"],
                cta: "Start free",
                highlighted: false,
                badge: null,
              },
              {
                name: "Solo",
                price: "$15",
                period: "/ month",
                desc: "For freelancers picking up speed",
                features: ["10 keywords", "50 leads / month", "Slack alerts", "All 4 sources", "CSV export"],
                cta: "Start free trial",
                highlighted: false,
                badge: null,
              },
              {
                name: "Pro",
                price: "$35",
                period: "/ month",
                desc: "Unlimited leads + AI replies",
                features: ["Unlimited keywords", "Unlimited leads", "Instant alerts", "AI reply drafts", "Slack + email", "Priority support"],
                cta: "Start free trial",
                highlighted: true,
                badge: "Most popular",
              },
              {
                name: "Agency",
                price: "$99",
                period: "/ month",
                desc: "For teams running client campaigns",
                features: ["Everything in Pro", "5 team seats", "Client workspaces", "Dedicated support"],
                cta: "Start free trial",
                highlighted: false,
                badge: null,
              },
            ].map((plan, i) => (
              <div
                key={plan.name}
                className={`fade-up fade-delay-${i + 1} relative flex flex-col rounded-2xl ${
                  plan.highlighted
                    ? "spin-border bg-[#0e0e18]"
                    : "border border-white/[0.07] bg-[#0e0e18]"
                }`}
              >
                <div className={`flex flex-1 flex-col rounded-2xl p-6 ${plan.highlighted ? "bg-[#0e0e18]" : ""}`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-[0_0_16px_rgba(99,102,241,0.5)]">
                      {plan.badge}
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#52526a]">
                      {plan.name}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-white">{plan.price}</span>
                      <span className="text-sm text-[#303048]">{plan.period}</span>
                    </div>
                    <p className="mt-1.5 text-xs text-[#303048]">{plan.desc}</p>
                  </div>

                  <ul className="mb-8 flex-1 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckIcon className={`shrink-0 ${plan.highlighted ? 'text-indigo-400' : 'text-[#52526a]'}`} />
                        <span className="text-[#8888a8]">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/sign-up"
                    className={`btn-glow block rounded-xl py-2.5 text-center text-sm font-semibold transition-all duration-200 ${
                      plan.highlighted
                        ? "bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-[0_0_24px_rgba(99,102,241,0.4)]"
                        : "border border-white/[0.08] text-[#8888a8] hover:border-white/[0.15] hover:text-white"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="bg-[#0a0a12] px-5 py-28">
        <div className="mx-auto max-w-2xl">
          <div className="fade-up mb-12 text-center">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-[#52526a]">
              FAQ
            </p>
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Common questions
            </h2>
          </div>
          <FAQAccordion />
        </div>
      </section>

      {/* ─── Final CTA ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-5 py-36">
        {/* Glow background */}
        <div
          className="glow-pulse glow-orb pointer-events-none absolute inset-x-0 top-1/2 h-[600px] -translate-y-1/2"
          style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.18) 0%, rgba(139,92,246,0.06) 40%, transparent 70%)" }}
        />
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-25" />

        <div className="relative mx-auto max-w-2xl text-center">
          <div className="fade-up">
            <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-[#0e0e18] px-5 py-2">
              <div className="relative flex h-1.5 w-1.5 items-center justify-center">
                <span className="pulse-ring absolute h-1.5 w-1.5 rounded-full bg-emerald-400/50" />
                <span className="blink-dot h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </div>
              <span className="text-sm text-[#8888a8]">Monitoring right now</span>
            </div>

            <h2 className="mb-5 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Your next client posted{" "}
              <span className="shimmer-text">12 minutes ago.</span>
            </h2>
            <p className="mb-10 text-lg text-[#52526a]">
              LeadPulse is already watching. You just need to show up.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/sign-up"
                className="btn-glow inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_0_1px_rgba(99,102,241,0.3)] transition-all duration-200 hover:bg-indigo-500 hover:shadow-[0_0_40px_rgba(99,102,241,0.55)]"
              >
                Get started free
                <ArrowRightIcon />
              </Link>
              <span className="text-sm text-[#303048]">No credit card · Cancel anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] px-5 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <span className="text-sm font-bold text-white">LeadPulse</span>
            </div>
            <p className="text-xs text-[#303048]">Freelancer leads on autopilot.</p>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#303048]">
            <Link href="/sign-in" className="hover:text-white transition-colors duration-150">Sign in</Link>
            <a href="#" className="hover:text-white transition-colors duration-150">Privacy</a>
            <a href="#" className="hover:text-white transition-colors duration-150">Terms</a>
            <span>© {new Date().getFullYear()} LeadPulse</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function AvatarStack() {
  const avatars = [
    { initial: "S", bg: "bg-indigo-500/30 text-indigo-300" },
    { initial: "M", bg: "bg-emerald-500/30 text-emerald-300" },
    { initial: "P", bg: "bg-violet-500/30 text-violet-300" },
    { initial: "J", bg: "bg-amber-500/30 text-amber-300" },
    { initial: "T", bg: "bg-blue-500/30 text-blue-300" },
  ];
  return (
    <div className="flex items-center -space-x-2">
      {avatars.map((a, i) => (
        <div
          key={i}
          className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#06060b] text-xs font-semibold ${a.bg}`}
        >
          {a.initial}
        </div>
      ))}
    </div>
  );
}

function CheckMiniBadge() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5.5" stroke="rgba(99,102,241,0.4)" strokeWidth="1" />
      <path d="M3.5 6L5 7.5L8.5 4.5" stroke="#6366f1" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Icons ─────────────────────────────────────────────────────────────────────

function ArrowRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 5v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 2l14 14M7.5 7.6A3 3 0 0011.4 11.4M4.5 4.6C2.8 5.9 1.5 7.5 1.5 9c0 2.5 3.4 6 7.5 6 1.5 0 2.9-.5 4.1-1.3M7.5 3.1C8 3 8.5 3 9 3c4.1 0 7.5 3.5 7.5 6 0 1-.4 2-1 2.9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M2 4h14M5 9h8M8 14h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function RadarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9l4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="9" r="1" fill="currentColor" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2v2.5M9 13.5V16M2 9h2.5M13.5 9H16M4.1 4.1l1.8 1.8M12.1 12.1l1.8 1.8M4.1 13.9l1.8-1.8M12.1 5.9l1.8-1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M10.5 2L4 10h5.5L7.5 16 14 8H8.5L10.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M9 2a5.5 5.5 0 015.5 5.5c0 3.5 1.5 4.5 1.5 5.5H2c0-1 1.5-2 1.5-5.5A5.5 5.5 0 019 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 13a2 2 0 004 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M15.5 11.5V6.5L9 3 2.5 6.5v5L9 15l6.5-3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 3v12M2.5 6.5l6.5 3.5 6.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className={className}>
      <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
