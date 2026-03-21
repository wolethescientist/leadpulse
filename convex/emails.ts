import { internalAction, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Resend } from "@convex-dev/resend";
import { components } from "./_generated/api";
import { Doc, Id } from "./_generated/dataModel";

// components.resend is generated after `npx convex dev` registers the component.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const resend = new Resend((components as any).resend, {});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://leadpulse.app";
const FROM_EMAIL = "LeadPulse <alerts@leadpulse.app>";

// ─── Internal queries ────────────────────────────────────────────────────────

export const getUserForEmail = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const getNewLeadsForDigest = internalQuery({
  args: { userId: v.id("users"), since: v.number() },
  handler: async (ctx, args) => {
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_user_status", (q) =>
        q.eq("userId", args.userId).eq("status", "new")
      )
      .order("desc")
      .take(50);

    const recent = leads.filter((l) => l._creationTime >= args.since);

    const results = await Promise.all(
      recent.map(async (lead) => {
        const post = await ctx.db.get(lead.rawPostId);
        if (!post) return null;
        return { ...lead, post };
      })
    );

    return results.filter(
      (r): r is NonNullable<typeof r> => r !== null
    );
  },
});

export const getLeadWithPost = internalQuery({
  args: { leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const lead = await ctx.db.get(args.leadId);
    if (!lead) return null;
    const post = await ctx.db.get(lead.rawPostId);
    if (!post) return null;
    return { ...lead, post };
  },
});

// ─── HTML builders ───────────────────────────────────────────────────────────

type LeadWithPost = Doc<"leads"> & { post: Doc<"rawPosts"> };

const SOURCE_LABELS: Record<string, string> = {
  reddit: "Reddit",
  hackernews: "Hacker News",
  remotive: "Remotive",
  weworkremotely: "We Work Remotely",
};

function topSignal(signals: unknown): string {
  const s = signals as Record<string, boolean> | null;
  if (!s) return "";
  const labels: Record<string, string> = {
    urgency_intent: "Urgent",
    switching_intent: "Switching",
    budget_intent: "Budget",
    evaluation_intent: "Evaluating",
    automation_intent: "Automation",
  };
  for (const [key, label] of Object.entries(labels)) {
    if (s[key]) return label;
  }
  return "";
}

function buildDigestHtml(leads: LeadWithPost[], dashboardUrl: string): string {
  const rows = leads
    .map(
      (l) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #1e1e2e;">
        <a href="${l.post.url}" style="color:#818cf8;font-weight:600;text-decoration:none;"
           target="_blank">${escHtml(l.post.title)}</a>
        <div style="margin-top:4px;font-size:12px;color:#6b6b7e;">
          ${SOURCE_LABELS[l.post.platform] ?? l.post.platform}
          &nbsp;·&nbsp; Score: <strong style="color:${l.score >= 90 ? "#34d399" : "#fbbf24"}">${l.score}</strong>
          ${topSignal(l.signals) ? `&nbsp;·&nbsp; ${topSignal(l.signals)}` : ""}
          &nbsp;·&nbsp; Keyword: <em>${escHtml(l.matchedKeyword)}</em>
        </div>
      </td>
    </tr>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#c4c4d4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#13131a;border-radius:16px;overflow:hidden;border:1px solid #1e1e2e;">
        <!-- Header -->
        <tr><td style="padding:32px 32px 24px;border-bottom:1px solid #1e1e2e;">
          <div style="font-size:22px;font-weight:700;color:#fff;">LeadPulse</div>
          <div style="font-size:14px;color:#6b6b7e;margin-top:4px;">Your daily lead digest</div>
        </td></tr>
        <!-- Leads -->
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        </td></tr>
        <!-- CTA -->
        <tr><td style="padding:24px 32px;border-top:1px solid #1e1e2e;text-align:center;">
          <a href="${dashboardUrl}"
             style="display:inline-block;background:#4f46e5;color:#fff;font-weight:600;font-size:14px;
                    text-decoration:none;padding:12px 28px;border-radius:8px;">
            View all leads →
          </a>
          <div style="margin-top:16px;font-size:12px;color:#4a4a5e;">
            You're receiving this because you're on the LeadPulse Solo plan.
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildInstantAlertHtml(lead: LeadWithPost): string {
  const signal = topSignal(lead.signals);
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#c4c4d4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#13131a;border-radius:16px;border:1px solid #2a2a3e;overflow:hidden;">
        <tr><td style="padding:24px 28px;border-bottom:1px solid #1e1e2e;">
          <span style="font-size:22px;font-weight:700;color:#fff;">🔥 New lead</span>
        </td></tr>
        <tr><td style="padding:24px 28px;">
          <div style="font-size:16px;font-weight:600;color:#fff;margin-bottom:12px;">
            <a href="${lead.post.url}" style="color:#818cf8;text-decoration:none;" target="_blank">
              ${escHtml(lead.post.title)}
            </a>
          </div>
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:20px;font-size:13px;color:#6b6b7e;">Score</td>
              <td style="font-size:13px;font-weight:600;color:${lead.score >= 90 ? "#34d399" : "#fbbf24"}">${lead.score}</td>
            </tr>
            <tr>
              <td style="padding-right:20px;font-size:13px;color:#6b6b7e;">Source</td>
              <td style="font-size:13px;color:#c4c4d4;">${SOURCE_LABELS[lead.post.platform] ?? lead.post.platform}</td>
            </tr>
            <tr>
              <td style="padding-right:20px;font-size:13px;color:#6b6b7e;">Keyword</td>
              <td style="font-size:13px;color:#c4c4d4;">${escHtml(lead.matchedKeyword)}</td>
            </tr>
            ${signal ? `<tr>
              <td style="padding-right:20px;font-size:13px;color:#6b6b7e;">Signal</td>
              <td style="font-size:13px;color:#c4c4d4;">${signal}</td>
            </tr>` : ""}
          </table>
        </td></tr>
        <tr><td style="padding:20px 28px;border-top:1px solid #1e1e2e;text-align:center;">
          <a href="${APP_URL}/dashboard"
             style="display:inline-block;background:#4f46e5;color:#fff;font-weight:600;font-size:13px;
                    text-decoration:none;padding:10px 24px;border-radius:8px;">
            View in dashboard →
          </a>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export const sendDailyDigest = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.emails.getUserForEmail, {
      userId: args.userId,
    });
    if (!user) return;

    const since = Date.now() - 24 * 60 * 60 * 1000;
    const leads = (await ctx.runQuery(internal.emails.getNewLeadsForDigest, {
      userId: args.userId,
      since,
    })) as LeadWithPost[];

    if (leads.length === 0) return;
    if (!user.email) return;

    const subject = `Your LeadPulse digest — ${leads.length} new lead${leads.length !== 1 ? "s" : ""} today`;
    const html = buildDigestHtml(leads, `${APP_URL}/dashboard`);

    await resend.sendEmail(ctx, {
      from: FROM_EMAIL,
      to: user.email,
      subject,
      html,
    });

    console.log(`[digest] Sent ${leads.length} leads to ${user.email}`);
  },
});

export const sendInstantAlert = internalAction({
  args: { userId: v.id("users"), leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.emails.getUserForEmail, {
      userId: args.userId,
    });
    if (!user) return;

    // Plan gate: Pro/Agency only
    if (user.plan !== "pro" && user.plan !== "agency") return;
    // User-level toggle
    if (!user.instantAlerts) return;
    if (!user.email) return;

    const lead = (await ctx.runQuery(internal.emails.getLeadWithPost, {
      leadId: args.leadId,
    })) as LeadWithPost | null;
    if (!lead) return;

    const subject = `🔥 New lead: ${lead.post.title.slice(0, 60)} (Score: ${lead.score})`;
    const html = buildInstantAlertHtml(lead);

    await resend.sendEmail(ctx, {
      from: FROM_EMAIL,
      to: user.email,
      subject,
      html,
    });

    console.log(`[instant] Sent alert to ${user.email} for lead ${args.leadId}`);
  },
});

export const sendSlackAlert = internalAction({
  args: { userId: v.id("users"), leadId: v.id("leads") },
  handler: async (ctx, args) => {
    const user = await ctx.runQuery(internal.emails.getUserForEmail, {
      userId: args.userId,
    });
    if (!user?.slackWebhook) return;

    const lead = (await ctx.runQuery(internal.emails.getLeadWithPost, {
      leadId: args.leadId,
    })) as LeadWithPost | null;
    if (!lead) return;

    const signal = topSignal(lead.signals);
    const scoreColor = lead.score >= 90 ? "#34d399" : "#fbbf24";

    const body = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `🔥 New LeadPulse lead (Score: ${lead.score})`,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*<${lead.post.url}|${lead.post.title}>*`,
          },
        },
        {
          type: "section",
          fields: [
            { type: "mrkdwn", text: `*Source:*\n${SOURCE_LABELS[lead.post.platform] ?? lead.post.platform}` },
            { type: "mrkdwn", text: `*Score:*\n${lead.score}` },
            { type: "mrkdwn", text: `*Keyword:*\n${lead.matchedKeyword}` },
            ...(signal ? [{ type: "mrkdwn", text: `*Signal:*\n${signal}` }] : []),
          ],
        },
        {
          type: "actions",
          elements: [
            {
              type: "button",
              text: { type: "plain_text", text: "View in dashboard" },
              url: `${APP_URL}/dashboard`,
              style: "primary",
            },
            {
              type: "button",
              text: { type: "plain_text", text: "View post" },
              url: lead.post.url,
            },
          ],
        },
      ],
      attachments: [
        {
          color: scoreColor,
          fallback: `New lead: ${lead.post.title} — Score ${lead.score}`,
        },
      ],
    };

    const res = await fetch(user.slackWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`[slack] Webhook failed: ${res.status} ${await res.text()}`);
    } else {
      console.log(`[slack] Alert sent for lead ${args.leadId}`);
    }
  },
});

export const runDailyDigests = internalAction({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.runQuery(internal.scrapers.db.getOnboardedUsers, {});

    // Solo plan users only (Pro/Agency get instant alerts)
    const soloUsers = users.filter((u) => u.plan === "solo");

    if (soloUsers.length === 0) {
      console.log("[digest] No solo users, skipping.");
      return;
    }

    console.log(`[digest] Running for ${soloUsers.length} solo user(s).`);

    for (const user of soloUsers) {
      try {
        await ctx.runAction(internal.emails.sendDailyDigest, {
          userId: user._id,
        });
      } catch (err) {
        console.error(`[digest] Failed for user ${user._id}:`, err);
      }
    }
  },
});
