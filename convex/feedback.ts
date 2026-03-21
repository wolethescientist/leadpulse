import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const submitNPS = mutation({
  args: {
    score: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    await ctx.db.patch(userId, {
      npsScore: args.score,
      npsSubmittedAt: Date.now(),
    });
  },
});

export const submitTestimonial = mutation({
  args: {
    niche: v.string(),
    resultText: v.string(),
    isPublic: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return;

    await ctx.db.insert("testimonials", {
      userId,
      niche: args.niche.trim(),
      resultText: args.resultText.trim(),
      isPublic: args.isPublic,
      createdAt: Date.now(),
    });
  },
});
