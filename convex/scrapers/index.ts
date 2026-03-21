import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Doc, Id } from "../_generated/dataModel";
import { scrapeHackerNewsImpl } from "./hackernews";
import { scrapeRemotiveImpl } from "./remotive";
import { scrapeWeWorkRemotelyImpl } from "./weworkremotely";

const DEFAULT_SUBREDDITS = [
  "forhire",
  "freelance",
  "hiring",
  "entrepreneur",
  "webdev",
  "design",
  "copywriting",
  "SEO",
  "slavelabour",
  "jobs",
];

type ScraperResult = {
  source: string;
  newCount: number;
  errors: number;
};

export const orchestrate = internalAction({
  args: { userId: v.id("users") },
  handler: async (ctx, args): Promise<ScraperResult[]> => {
    const keywords: Doc<"keywords">[] = await ctx.runQuery(
      internal.scrapers.db.getUserKeywords,
      { userId: args.userId }
    );

    const activeTerms: string[] = keywords
      .filter((k) => k.isActive)
      .map((k) => k.term);

    if (activeTerms.length === 0) {
      console.log("No active keywords for user, skipping scrape.");
      return [];
    }

    const [hnResult, remotiveResult, wwrResult] =
      await Promise.all([
        // HN, Remotive, WWR share the same V8 runtime — call impl directly
        scrapeHackerNewsImpl(ctx, activeTerms).catch((err: unknown) => {
          console.error("HN scraper failed:", err);
          return { newIds: [] as Id<"rawPosts">[], errors: 1 };
        }),

        scrapeRemotiveImpl(ctx, activeTerms).catch((err: unknown) => {
          console.error("Remotive scraper failed:", err);
          return { newIds: [] as Id<"rawPosts">[], errors: 1 };
        }),

        scrapeWeWorkRemotelyImpl(ctx, activeTerms).catch((err: unknown) => {
          console.error("WWR scraper failed:", err);
          return { newIds: [] as Id<"rawPosts">[], errors: 1 };
        }),
      ]);

    // Reddit disabled — pending API access approval
    // ctx.runAction(internal.scrapers.reddit.scrapeReddit, { subreddits: DEFAULT_SUBREDDITS, keywords: activeTerms })

    const results: ScraperResult[] = [
      { source: "hackernews", newCount: hnResult.newIds.length, errors: hnResult.errors },
      { source: "remotive", newCount: remotiveResult.newIds.length, errors: remotiveResult.errors },
      { source: "weworkremotely", newCount: wwrResult.newIds.length, errors: wwrResult.errors },
    ];

    console.log(
      "Scrape complete:",
      results.map((r) => `${r.source}=${r.newCount}`).join(", ")
    );

    return results;
  },
});
