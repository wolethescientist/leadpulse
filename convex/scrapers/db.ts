import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

export const getUserKeywords = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("keywords")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .take(100);
  },
});

export const insertRawPost = internalMutation({
  args: {
    platform: v.union(
      v.literal("reddit"),
      v.literal("hackernews"),
      v.literal("remotive"),
      v.literal("weworkremotely")
    ),
    externalId: v.string(),
    title: v.string(),
    body: v.string(),
    url: v.string(),
    author: v.string(),
    postedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("rawPosts")
      .withIndex("by_external_id", (q) =>
        q.eq("platform", args.platform).eq("externalId", args.externalId)
      )
      .unique();

    if (existing) return null;

    return await ctx.db.insert("rawPosts", args);
  },
});

export const getRawPost = internalQuery({
  args: { rawPostId: v.id("rawPosts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.rawPostId);
  },
});

export const checkLeadExists = internalQuery({
  args: { userId: v.id("users"), rawPostId: v.id("rawPosts") },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("leads")
      .withIndex("by_user_and_raw_post", (q) =>
        q.eq("userId", args.userId).eq("rawPostId", args.rawPostId)
      )
      .unique();
    return existing !== null;
  },
});

export const insertLead = internalMutation({
  args: {
    userId: v.id("users"),
    rawPostId: v.id("rawPosts"),
    score: v.number(),
    signals: v.any(),
    matchedKeyword: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"leads"> | null> => {
    // Re-check inside mutation to prevent race conditions
    const existing = await ctx.db
      .query("leads")
      .withIndex("by_user_and_raw_post", (q) =>
        q.eq("userId", args.userId).eq("rawPostId", args.rawPostId)
      )
      .unique();
    if (existing) return null;

    return await ctx.db.insert("leads", {
      userId: args.userId,
      rawPostId: args.rawPostId,
      score: args.score,
      signals: args.signals,
      matchedKeyword: args.matchedKeyword,
      status: "new",
    });
  },
});

export const getRecentRawPosts = internalQuery({
  args: { since: v.number() },
  handler: async (ctx, args) => {
    const posts = await ctx.db.query("rawPosts").order("desc").take(50);
    return posts.filter((p) => p._creationTime >= args.since);
  },
});

export const getOnboardedUsers = internalQuery({
  args: {},
  handler: async (ctx) => {
    // Include users who completed the tour OR who at minimum finished the setup wizard.
    // We check both because completeOnboarding (tour end) was historically broken.
    const byOnboarding = await ctx.db
      .query("users")
      .withIndex("by_onboardingCompleted", (q) =>
        q.eq("onboardingCompleted", true)
      )
      .take(50);

    const all = await ctx.db.query("users").take(100);
    const wizardOnly = all.filter(
      (u) => u.wizardCompleted && !u.onboardingCompleted
    );

    const seen = new Set(byOnboarding.map((u) => u._id));
    return [...byOnboarding, ...wizardOnly.filter((u) => !seen.has(u._id))];
  },
});
