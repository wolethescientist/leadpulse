"use node";

import { action } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { internal } from "./_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Id } from "./_generated/dataModel";

export const generateReplyDraft = action({
  args: {
    leadId: v.id("leads"),
    tone: v.union(
      v.literal("professional"),
      v.literal("friendly"),
      v.literal("brief")
    ),
    variationNum: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");
    const userId = identity.subject as Id<"users">;

    const user = await ctx.runQuery(internal.billing.getUserForAction, {
      userId,
    });

    if (!user || (user.plan !== "pro" && user.plan !== "agency")) {
      throw new ConvexError(
        "AI reply drafts require a Pro or Agency plan."
      );
    }

    const lead = await ctx.runQuery(internal.leads.getLeadWithPost, {
      leadId: args.leadId,
    });

    if (!lead) throw new ConvexError("Lead not found.");

    const signals = (lead.signals as Record<string, boolean> | null) ?? {};
    const activeSignals = Object.entries(signals)
      .filter(([, active]) => active)
      .map(([key]) => key.replace(/_intent$/, "").replace(/_/g, " "))
      .join(", ");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new ConvexError("Gemini API key not configured.");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You help freelancers respond to job posts. Write a ${args.tone} outreach reply that:
- Directly addresses their specific need mentioned in the post
- Is 3-5 sentences max
- Does NOT mention pricing
- Ends with a soft CTA ("Happy to share examples if useful")
- Sounds human — not templated or AI-generated
- This is variation ${args.variationNum} so make it distinct from previous versions

Post title: ${lead.post.title}
Post body: ${lead.post.body.slice(0, 1500)}
Intent signals: ${activeSignals || "none"}`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim();

    return { reply };
  },
});
