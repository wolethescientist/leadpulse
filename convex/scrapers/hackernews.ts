import { internalAction, ActionCtx } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

interface HNHit {
  objectID: string;
  title?: string;
  story_title?: string;
  story_text?: string;
  comment_text?: string;
  url?: string;
  story_url?: string;
  author?: string;
  created_at_i?: number;
}

export async function scrapeHackerNewsImpl(
  ctx: ActionCtx,
  keywords: string[]
): Promise<{ newIds: Id<"rawPosts">[]; errors: number }> {
  const newIds: Id<"rawPosts">[] = [];
  let errors = 0;
  const seen = new Set<string>();

  for (const keyword of keywords) {
    try {
      // Search stories AND job-type posts. The `tags=job` filter only matches
      // HN "job" story type, which misses most "Ask HN: Who is hiring?" content.
      // Searching without a type tag returns all relevant story matches.
      const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(keyword)}&tags=(job,story)&hitsPerPage=30&numericFilters=created_at_i>${Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000)}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`HN API error for keyword "${keyword}": ${res.status}`);
        errors++;
        continue;
      }

      const data = (await res.json()) as { hits: HNHit[] };

      for (const hit of data.hits ?? []) {
        const externalId = "hn_" + hit.objectID;
        if (seen.has(externalId)) continue;
        seen.add(externalId);

        try {
          const title = hit.title ?? hit.story_title ?? "";
          const body = hit.story_text ?? hit.comment_text ?? "";
          const hitUrl =
            hit.url ??
            hit.story_url ??
            `https://news.ycombinator.com/item?id=${hit.objectID}`;
          const author = hit.author ?? "[unknown]";
          const postedAt = (hit.created_at_i ?? 0) * 1000;

          const id = await ctx.runMutation(internal.scrapers.db.insertRawPost, {
            platform: "hackernews",
            externalId,
            title,
            body,
            url: hitUrl,
            author,
            postedAt,
          });

          if (id) newIds.push(id);
        } catch (hitErr) {
          console.error(`Error processing HN hit ${hit.objectID}:`, hitErr);
          errors++;
        }
      }
    } catch (kwErr) {
      console.error(`Error fetching HN for keyword "${keyword}":`, kwErr);
      errors++;
    }
  }

  return { newIds, errors };
}

export const scrapeHackerNews = internalAction({
  args: { keywords: v.array(v.string()) },
  handler: async (ctx, args): Promise<Id<"rawPosts">[]> => {
    const { newIds } = await scrapeHackerNewsImpl(ctx, args.keywords);
    return newIds;
  },
});
