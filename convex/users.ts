import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .unique();
  },
});

export const updateUserSettings = mutation({
  args: {
    instantAlerts: v.optional(v.boolean()),
    timezone: v.optional(v.string()),
    slackWebhook: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .unique();
    if (!user) throw new Error("User not found");
    const updates: { instantAlerts?: boolean; timezone?: string; slackWebhook?: string } = {};
    if (args.instantAlerts !== undefined) updates.instantAlerts = args.instantAlerts;
    if (args.timezone !== undefined) updates.timezone = args.timezone;
    if (args.slackWebhook !== undefined) updates.slackWebhook = args.slackWebhook;
    await ctx.db.patch(user._id, updates);
  },
});

export const resetOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .unique();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { onboardingCompleted: false });
  },
});

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", identity.email))
      .unique();
    if (!user) throw new Error("User not found");
    const userId = user._id;

    const keywords = await ctx.db.query("keywords").withIndex("by_user", q => q.eq("userId", userId)).take(200);
    for (const k of keywords) await ctx.db.delete(k._id);

    const sources = await ctx.db.query("sources").withIndex("by_user", q => q.eq("userId", userId)).take(10);
    for (const s of sources) await ctx.db.delete(s._id);

    const leads = await ctx.db.query("leads").withIndex("by_user", q => q.eq("userId", userId)).take(200);
    for (const l of leads) await ctx.db.delete(l._id);

    await ctx.db.delete(userId);
  },
});
