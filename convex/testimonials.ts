import { query } from "./_generated/server";
import { v } from "convex/values";

export const getPublicTestimonials = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("testimonials")
      .withIndex("by_public", (q) => q.eq("isPublic", true))
      .take(6);
  },
});
