"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

interface ScoreResult {
  score: number;
  signals: {
    switching_intent: boolean;
    budget_intent: boolean;
    urgency_intent: boolean;
    evaluation_intent: boolean;
    automation_intent: boolean;
  };
  reason: string;
}

function buildPrompt(title: string, body: string): string {
  return `You score Reddit and job board posts for freelancer hiring intent.
Score 0-100 where 100 = actively hiring a freelancer right now.
Detect which signals are present: switching_intent, budget_intent, urgency_intent, evaluation_intent, automation_intent.
Post title: ${title}
Post body: ${body}
Respond ONLY with valid JSON, no markdown:
{"score":85,"signals":{"switching_intent":true,"budget_intent":false,"urgency_intent":true,"evaluation_intent":true,"automation_intent":false},"reason":"one sentence"}`;
}

async function scoreWithGemini(prompt: string): Promise<string> {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function scoreWithGroq(prompt: string): Promise<string> {
  const Groq = (await import("groq-sdk")).default;
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const completion = await groq.chat.completions.create({
    model: "llama3-8b-8192",
    messages: [{ role: "user", content: prompt }],
  });
  return completion.choices[0]?.message?.content ?? "";
}

function parseScore(raw: string): ScoreResult {
  const cleaned = raw.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned) as ScoreResult;
}

export const scorePost = internalAction({
  args: {
    rawPostId: v.id("rawPosts"),
    userId: v.id("users"),
    matchedKeyword: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ score: number; signals: object; inserted: boolean }> => {
    const post = await ctx.runQuery(internal.scrapers.db.getRawPost, {
      rawPostId: args.rawPostId,
    });

    if (!post) {
      console.error(`[scorer] rawPost not found: ${args.rawPostId}`);
      return { score: 0, signals: {}, inserted: false };
    }

    const prompt = buildPrompt(post.title, post.body);

    let rawResponse = "";
    try {
      rawResponse = await scoreWithGemini(prompt);
    } catch (geminiErr) {
      console.error("[scorer] Gemini failed, retrying with Groq:", geminiErr);
      try {
        rawResponse = await scoreWithGroq(prompt);
      } catch (groqErr) {
        console.error("[scorer] Groq also failed:", groqErr);
        return { score: 0, signals: {}, inserted: false };
      }
    }

    let parsed: ScoreResult;
    try {
      parsed = parseScore(rawResponse);
    } catch (parseErr) {
      console.error("[scorer] Failed to parse AI response:", rawResponse, parseErr);
      return { score: 0, signals: {}, inserted: false };
    }

    const { score, signals, reason } = parsed;
    console.log(
      `[scorer] post=${args.rawPostId} keyword="${args.matchedKeyword}" score=${score} reason="${reason}"`
    );

    let inserted = false;
    let insertedLeadId: Id<"leads"> | null = null;
    if (score >= 70) {
      insertedLeadId = await ctx.runMutation(
        internal.scrapers.db.insertLead,
        {
          userId: args.userId,
          rawPostId: args.rawPostId,
          score,
          signals,
          matchedKeyword: args.matchedKeyword,
        }
      );
      inserted = insertedLeadId !== null;
    }

    // Fire notifications for newly inserted leads
    if (inserted && insertedLeadId) {
      try {
        await ctx.runAction(internal.emails.sendInstantAlert, {
          userId: args.userId,
          leadId: insertedLeadId,
        });
      } catch (err) {
        console.error("[scorer] sendInstantAlert failed:", err);
      }
      try {
        await ctx.runAction(internal.emails.sendSlackAlert, {
          userId: args.userId,
          leadId: insertedLeadId,
        });
      } catch (err) {
        console.error("[scorer] sendSlackAlert failed:", err);
      }
    }

    return { score, signals, inserted };
  },
});
