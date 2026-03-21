import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

const ALL_PLATFORMS = [
  "reddit",
  "hackernews",
  "remotive",
  "weworkremotely",
] as const;

export const getSources = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const userId = identity.subject as Id<"users">;

    return await ctx.db
      .query("sources")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(10);
  },
});

export const toggleSource = mutation({
  args: {
    sourceId: v.id("sources"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject as Id<"users">;

    const source = await ctx.db.get(args.sourceId);
    if (!source || source.userId !== userId) {
      throw new Error("Source not found");
    }

    await ctx.db.patch(args.sourceId, { isActive: !source.isActive });
  },
});

export const initDefaultSources = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject as Id<"users">;

    for (const platform of ALL_PLATFORMS) {
      const existing = await ctx.db
        .query("sources")
        .withIndex("by_user_and_platform", (q) =>
          q.eq("userId", userId).eq("platform", platform)
        )
        .unique();

      if (!existing) {
        await ctx.db.insert("sources", {
          userId,
          platform,
          config: {},
          isActive: true,
        });
      }
    }
  },
});
