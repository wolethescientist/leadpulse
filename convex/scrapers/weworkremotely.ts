import { internalAction, ActionCtx } from "../_generated/server";
import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

function extractTagValue(xml: string, tag: string): string {
  const cdataRe = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i");
  const plainRe = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i");
  const cdataMatch = xml.match(cdataRe);
  if (cdataMatch) return cdataMatch[1].trim();
  const plainMatch = xml.match(plainRe);
  return plainMatch ? plainMatch[1].trim() : "";
}

function extractItems(feed: string): string[] {
  const items: string[] = [];
  const itemRe = /<item[\s>]([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;
  while ((match = itemRe.exec(feed)) !== null) {
    items.push(match[1]);
  }
  return items;
}

export async function scrapeWeWorkRemotelyImpl(
  ctx: ActionCtx,
  keywords: string[]
): Promise<{ newIds: Id<"rawPosts">[]; errors: number }> {
  const newIds: Id<"rawPosts">[] = [];
  let errors = 0;
  const lowerKeywords = keywords.map((k) => k.toLowerCase());

  try {
    const res = await fetch("https://weworkremotely.com/remote-jobs.rss", {
      headers: { "User-Agent": "leadpulse/1.0" },
    });
    if (!res.ok) {
      console.error(`WWR feed error: ${res.status}`);
      return { newIds, errors: 1 };
    }

    const xml = await res.text();
    const items = extractItems(xml);

    for (const item of items) {
      try {
        const title = extractTagValue(item, "title");
        const body = extractTagValue(item, "description");
        const combined = (title + " " + body).toLowerCase();

        const matched = lowerKeywords.some((k) => combined.includes(k));
        if (!matched) continue;

        const guid = extractTagValue(item, "guid");
        if (!guid) continue;

        const link = extractTagValue(item, "link") || guid;
        const author = extractTagValue(item, "author") || "[unknown]";
        const pubDate = extractTagValue(item, "pubDate");
        const postedAt = pubDate ? new Date(pubDate).getTime() : Date.now();

        const externalId = "wwr_" + guid;
        const id = await ctx.runMutation(internal.scrapers.db.insertRawPost, {
          platform: "weworkremotely",
          externalId,
          title,
          body,
          url: link,
          author,
          postedAt,
        });

        if (id) newIds.push(id);
      } catch (itemErr) {
        console.error("Error processing WWR item:", itemErr);
        errors++;
      }
    }
  } catch (err) {
    console.error("Error fetching WWR feed:", err);
    errors++;
  }

  return { newIds, errors };
}

export const scrapeWeWorkRemotely = internalAction({
  args: { keywords: v.array(v.string()) },
  handler: async (ctx, args): Promise<Id<"rawPosts">[]> => {
    const { newIds } = await scrapeWeWorkRemotelyImpl(ctx, args.keywords);
    return newIds;
  },
});
