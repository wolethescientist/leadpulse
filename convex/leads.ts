import { internalQuery, query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const getLeadsForUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject as Id<"users">;

    const leads = await ctx.db
      .query("leads")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(200);

    const results = await Promise.all(
      leads.map(async (lead) => {
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

export const updateLeadStatus = mutation({
  args: {
    leadId: v.id("leads"),
    status: v.union(
      v.literal("new"),
      v.literal("viewed"),
      v.literal("saved"),
      v.literal("archived"),
      v.literal("dismissed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.leadId, { status: args.status });
  },
});

export const submitFeedback = mutation({
  args: {
    leadId: v.id("leads"),
    feedback: v.union(v.literal("good"), v.literal("bad")),
    feedbackNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const update: {
      feedback: "good" | "bad";
      feedbackNote?: string;
    } = { feedback: args.feedback };
    if (args.feedbackNote !== undefined) {
      update.feedbackNote = args.feedbackNote;
    }
    await ctx.db.patch(args.leadId, update);
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

export const getLeadStats = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { total: 0, newToday: 0, avgScore: 0 };
    const userId = identity.subject as Id<"users">;

    const leads = await ctx.db
      .query("leads")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(500);

    const total = leads.length;

    const now = Date.now();
    const startOfTodayMs = now - (now % 86_400_000);

    const newToday = leads.filter(
      (l) => l._creationTime >= startOfTodayMs
    ).length;

    const avgScore =
      total > 0
        ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / total)
        : 0;

    return { total, newToday, avgScore };
  },
});
