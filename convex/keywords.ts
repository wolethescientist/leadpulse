import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const KEYWORD_LIMITS: Record<string, number> = {
  free: 3,
  solo: 10,
  pro: Infinity,
  agency: Infinity,
};

export const addKeyword = mutation({
  args: {
    term: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");

    const limit = KEYWORD_LIMITS[user.plan] ?? 3;

    // Unlimited plans skip the count check entirely — .take(Infinity) is invalid.
    if (isFinite(limit)) {
      const existing = await ctx.db
        .query("keywords")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .take(limit + 1);

      if (existing.length >= limit) {
        throw new Error(`You've reached the keyword limit for your plan. Upgrade to add more.`);
      }
    }

    return await ctx.db.insert("keywords", {
      userId,
      term: args.term.trim(),
      isActive: true,
    });
  },
});

export const listKeywords = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("keywords")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .take(100);
  },
});

export const deleteKeyword = mutation({
  args: {
    keywordId: v.id("keywords"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const keyword = await ctx.db.get(args.keywordId);
    if (!keyword || keyword.userId !== userId) {
      throw new Error("Keyword not found");
    }

    await ctx.db.delete(args.keywordId);
  },
});

export const toggleKeyword = mutation({
  args: {
    keywordId: v.id("keywords"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const keyword = await ctx.db.get(args.keywordId);
    if (!keyword || keyword.userId !== userId) {
      throw new Error("Keyword not found");
    }

    await ctx.db.patch(args.keywordId, { isActive: !keyword.isActive });
  },
});
