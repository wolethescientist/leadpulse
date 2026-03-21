import { internalAction, ActionCtx } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

interface RemotiveJob {
  id: number;
  title: string;
  description: string;
  url: string;
  company_name?: string;
  publication_date?: string;
}

export async function scrapeRemotiveImpl(
  ctx: ActionCtx,
  keywords: string[]
): Promise<{ newIds: Id<"rawPosts">[]; errors: number }> {
  const newIds: Id<"rawPosts">[] = [];
  let errors = 0;
  const lowerKeywords = keywords.map((k) => k.toLowerCase());

  try {
    const res = await fetch("https://remotive.com/api/remote-jobs?limit=20");
    if (!res.ok) {
      console.error(`Remotive API error: ${res.status}`);
      return { newIds, errors: 1 };
    }

    const data = (await res.json()) as { jobs: RemotiveJob[] };

    for (const job of data.jobs ?? []) {
      try {
        const title = job.title ?? "";
        const body = job.description ?? "";
        const combined = (title + " " + body).toLowerCase();

        const matched = lowerKeywords.some((k) => combined.includes(k));
        if (!matched) continue;

        const externalId = "remotive_" + job.id;
        const id = await ctx.runMutation(internal.scrapers.db.insertRawPost, {
          platform: "remotive",
          externalId,
          title,
          body,
          url: job.url ?? "",
          author: job.company_name ?? "[unknown]",
          postedAt: job.publication_date
            ? new Date(job.publication_date).getTime()
            : Date.now(),
        });

        if (id) newIds.push(id);
      } catch (jobErr) {
        console.error(`Error processing Remotive job ${job.id}:`, jobErr);
        errors++;
      }
    }
  } catch (err) {
    console.error("Error fetching Remotive jobs:", err);
    errors++;
  }

  return { newIds, errors };
}

export const scrapeRemotive = internalAction({
  args: { keywords: v.array(v.string()) },
  handler: async (ctx, args): Promise<Id<"rawPosts">[]> => {
    const { newIds } = await scrapeRemotiveImpl(ctx, args.keywords);
    return newIds;
  },
});
