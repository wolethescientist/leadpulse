import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const testSlackWebhook = action({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.runQuery(api.users.getCurrentUser);

    if (!user?.slackWebhook) {
      throw new Error("No Slack webhook configured.");
    }

    const body = {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "✅ *LeadPulse webhook test*\nYour Slack integration is working. Lead alerts will be posted here.",
          },
        },
      ],
    };

    const res = await fetch(user.slackWebhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Webhook request failed (${res.status}). Check your URL and try again.`);
    }
  },
});
