import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const PLATFORM_VALIDATOR = v.union(
  v.literal("reddit"),
  v.literal("hackernews"),
  v.literal("remotive"),
  v.literal("weworkremotely")
);

export const saveWizardSetup = mutation({
  args: {
    keywords: v.array(v.string()),
    activePlatforms: v.array(PLATFORM_VALIDATOR),
    instantAlerts: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject as Id<"users">;

    // Insert keywords (skip duplicates)
    const existing = await ctx.db
      .query("keywords")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(100);
    const existingTerms = new Set(existing.map((k) => k.term.toLowerCase()));

    for (const term of args.keywords) {
      const normalized = term.trim();
      if (!normalized || existingTerms.has(normalized.toLowerCase())) continue;
      await ctx.db.insert("keywords", {
        userId,
        term: normalized,
        isActive: true,
      });
    }

    // Upsert sources — all 4 platforms, active = included in activePlatforms
    const allPlatforms = [
      "reddit",
      "hackernews",
      "remotive",
      "weworkremotely",
    ] as const;

    for (const platform of allPlatforms) {
      const existing = await ctx.db
        .query("sources")
        .withIndex("by_user_and_platform", (q) =>
          q.eq("userId", userId).eq("platform", platform)
        )
        .unique();

      const isActive = args.activePlatforms.includes(platform);

      if (existing) {
        await ctx.db.patch(existing._id, { isActive });
      } else {
        await ctx.db.insert("sources", {
          userId,
          platform,
          config: {},
          isActive,
        });
      }
    }

    // Mark wizard complete + save alert preference
    await ctx.db.patch(userId, {
      wizardCompleted: true,
      instantAlerts: args.instantAlerts,
    });
  },
});

export const completeOnboarding = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const userId = identity.subject as Id<"users">;
    await ctx.db.patch(userId, { onboardingCompleted: true });
  },
});

export const dismissFlag = mutation({
  args: {
    flagKey: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const userId = identity.subject as Id<"users">;

    const user = await ctx.db.get(userId);
    if (!user) return;
    if (user.dismissedFlags.includes(args.flagKey)) return;
    await ctx.db.patch(userId, {
      dismissedFlags: [...user.dismissedFlags, args.flagKey],
    });
  },
});

export const getActiveFeatureFlags = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const all = await ctx.db.query("featureFlags").take(50);
    return all.filter((f) => f.activeFrom <= now && now <= f.activeTo);
  },
});
