"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import Snoowrap from "snoowrap";

export const scrapeReddit = internalAction({
  args: {
    subreddits: v.array(v.string()),
    keywords: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<Id<"rawPosts">[]> => {
    let reddit: Snoowrap;
    try {
      reddit = new Snoowrap({
        userAgent: "leadpulse/1.0 by u/leadpulse_bot",
        clientId: process.env.REDDIT_CLIENT_ID!,
        clientSecret: process.env.REDDIT_CLIENT_SECRET!,
        username: process.env.REDDIT_USERNAME!,
        password: process.env.REDDIT_PASSWORD!,
      });
    } catch (err) {
      console.error("Failed to initialize Reddit client:", err);
      return [];
    }

    const newPostIds: Id<"rawPosts">[] = [];
    const lowerKeywords = args.keywords.map((k) => k.toLowerCase());

    for (const subreddit of args.subreddits) {
      try {
        const posts = await reddit.getSubreddit(subreddit).getNew({ limit: 25 });

        for (const post of posts) {
          try {
            const title = post.title ?? "";
            const body = post.selftext ?? "";
            const combined = (title + " " + body).toLowerCase();

            const matched = lowerKeywords.some((k) => combined.includes(k));
            if (!matched) continue;

            const id = await ctx.runMutation(internal.scrapers.db.insertRawPost, {
              platform: "reddit",
              externalId: post.id,
              title,
              body,
              url: `https://reddit.com${post.permalink}`,
              author: typeof post.author === "string" ? post.author : (post.author?.name ?? "[deleted]"),
              postedAt: post.created_utc * 1000,
            });

            if (id) newPostIds.push(id);
          } catch (postErr) {
            console.error(`Error processing post ${(post as any).id}:`, postErr);
          }
        }
      } catch (subErr) {
        console.error(`Error fetching r/${subreddit}:`, subErr);
      }
    }

    return newPostIds;
  },
});
