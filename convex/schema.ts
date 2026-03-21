import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,
  users: defineTable({
    // Auth fields required by Convex Auth
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    // App fields
    plan: v.union(v.literal("free"), v.literal("solo"), v.literal("pro"), v.literal("agency")),
    trialEndsAt: v.optional(v.number()),
    subscriptionId: v.optional(v.string()),
    customerId: v.optional(v.string()),
    planRenewalDate: v.optional(v.number()),
    slackWebhook: v.optional(v.string()),
    instantAlerts: v.boolean(),
    timezone: v.string(),
    onboardingCompleted: v.boolean(),
    wizardCompleted: v.boolean(),
    npsScore: v.optional(v.number()),
    npsSubmittedAt: v.optional(v.number()),
    dismissedFlags: v.array(v.string()),
  })
    .index("email", ["email"])
    .index("by_onboardingCompleted", ["onboardingCompleted"]),

  keywords: defineTable({
    userId: v.id("users"),
    term: v.string(),
    isActive: v.boolean(),
  }).index("by_user", ["userId"]),

  sources: defineTable({
    userId: v.id("users"),
    platform: v.union(v.literal("reddit"), v.literal("hackernews"), v.literal("remotive"), v.literal("weworkremotely")),
    config: v.any(),
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_platform", ["userId", "platform"]),

  rawPosts: defineTable({
    platform: v.union(v.literal("reddit"), v.literal("hackernews"), v.literal("remotive"), v.literal("weworkremotely")),
    externalId: v.string(),
    title: v.string(),
    body: v.string(),
    url: v.string(),
    author: v.string(),
    postedAt: v.number(),
  }).index("by_external_id", ["platform", "externalId"]),

  leads: defineTable({
    userId: v.id("users"),
    rawPostId: v.id("rawPosts"),
    score: v.number(),
    signals: v.any(),
    status: v.union(v.literal("new"), v.literal("viewed"), v.literal("saved"), v.literal("archived"), v.literal("dismissed")),
    matchedKeyword: v.string(),
    feedback: v.optional(v.union(v.literal("good"), v.literal("bad"))),
    feedbackNote: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_user_and_raw_post", ["userId", "rawPostId"]),

  testimonials: defineTable({
    userId: v.id("users"),
    niche: v.string(),
    resultText: v.string(),
    isPublic: v.boolean(),
    createdAt: v.number(),
  }).index("by_public", ["isPublic"]),

  featureFlags: defineTable({
    key: v.string(),
    label: v.string(),
    targetEl: v.string(),
    activeFrom: v.number(),
    activeTo: v.number(),
  }),
});
