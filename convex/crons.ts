import { cronJobs } from "convex/server";
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";

// 20-minute window so we catch posts created since the last cron run
const RECENT_WINDOW_MS = 20 * 60 * 1000;

export const runPipeline = internalAction({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.runQuery(internal.scrapers.db.getOnboardedUsers, {});

    if (users.length === 0) {
      console.log("[pipeline] No onboarded users, skipping.");
      return;
    }

    console.log(`[pipeline] Running for ${users.length} user(s).`);

    for (const user of users) {
      try {
        // Step 1: scrape new posts for this user
        await ctx.runAction(internal.scrapers.index.orchestrate, {
          userId: user._id,
        });

        // Step 2: load the user's active keywords for keyword matching
        const keywords = await ctx.runQuery(
          internal.scrapers.db.getUserKeywords,
          { userId: user._id }
        );
        const activeTerms = keywords
          .filter((k) => k.isActive)
          .map((k) => k.term);

        if (activeTerms.length === 0) continue;

        // Step 3: score any posts from the last RECENT_WINDOW_MS that lack a lead
        const since = Date.now() - RECENT_WINDOW_MS;
        const recentPosts = await ctx.runQuery(
          internal.scrapers.db.getRecentRawPosts,
          { since }
        );

        for (const post of recentPosts) {
          try {
            const hasLead = await ctx.runQuery(
              internal.scrapers.db.checkLeadExists,
              { userId: user._id, rawPostId: post._id }
            );
            if (hasLead) continue;

            // Find the first keyword that appears in the post
            const combined = (post.title + " " + post.body).toLowerCase();
            const matchedKeyword =
              activeTerms.find((k) => combined.includes(k.toLowerCase())) ??
              activeTerms[0];

            await ctx.runAction(internal.scorer.scorePost, {
              rawPostId: post._id,
              userId: user._id,
              matchedKeyword,
            });
          } catch (postErr) {
            console.error(
              `[pipeline] Error scoring post ${post._id} for user ${user._id}:`,
              postErr
            );
          }
        }

        console.log(
          `[pipeline] Done for user ${user._id}: scored up to ${recentPosts.length} post(s).`
        );
      } catch (userErr) {
        console.error(`[pipeline] Error for user ${user._id}:`, userErr);
      }
    }
  },
});

const crons = cronJobs();

crons.interval(
  "run scrape and score pipeline",
  { minutes: 15 },
  internal.crons.runPipeline,
  {}
);

// Daily digest at 08:00 UTC for Solo-plan users
crons.cron(
  "daily digest",
  "0 8 * * *",
  internal.emails.runDailyDigests,
  {}
);

export default crons;
