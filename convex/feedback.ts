import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const submitNPS = mutation({
  args: {
    score: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const userId = identity.subject as Id<"users">;

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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;
    const userId = identity.subject as Id<"users">;

    await ctx.db.insert("testimonials", {
      userId,
      niche: args.niche.trim(),
      resultText: args.resultText.trim(),
      isPublic: args.isPublic,
      createdAt: Date.now(),
    });
  },
});
