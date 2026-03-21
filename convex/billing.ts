import {
  action,
  internalMutation,
  internalQuery,
  query,
} from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { checkout, customerPortal } from "./dodo";

// ─── Plan → Dodo product ID mapping ──────────────────────────────────────────

function productIdForPlan(plan: "solo" | "pro" | "agency"): string {
  const ids: Record<string, string | undefined> = {
    solo: process.env.DODO_SOLO_PRODUCT_ID,
    pro: process.env.DODO_PRO_PRODUCT_ID,
    agency: process.env.DODO_AGENCY_PRODUCT_ID,
  };
  const id = ids[plan];
  if (!id) throw new Error(`Missing Convex env var for plan: ${plan}`);
  return id;
}

// ─── Internal query ───────────────────────────────────────────────────────────

export const getUserForAction = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// ─── Public query ─────────────────────────────────────────────────────────────

export const getSubscriptionStatus = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userId = identity.subject as Id<"users">;

    const user = await ctx.db.get(userId);
    if (!user) return null;

    return {
      plan: user.plan,
      subscriptionId: user.subscriptionId ?? null,
      customerId: user.customerId ?? null,
      planRenewalDate: user.planRenewalDate ?? null,
    };
  },
});

// ─── Public actions ───────────────────────────────────────────────────────────

export const createCheckoutSession = action({
  args: {
    plan: v.union(v.literal("solo"), v.literal("pro"), v.literal("agency")),
    returnUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject as Id<"users">;

    // Validate returnUrl to prevent open-redirect abuse
    const allowedReturnHost = process.env.CONVEX_SITE_URL;
    if (allowedReturnHost) {
      try {
        const returnHost = new URL(args.returnUrl).origin;
        const allowedHost = new URL(allowedReturnHost).origin;
        if (returnHost !== allowedHost) {
          throw new Error("Invalid returnUrl: must be on the same origin as the app");
        }
      } catch (e: unknown) {
        if (e instanceof Error && e.message.startsWith("Invalid returnUrl")) throw e;
        throw new Error("Invalid returnUrl");
      }
    }

    const user = await ctx.runQuery(internal.billing.getUserForAction, {
      userId,
    });
    if (!user) throw new Error("User not found");

    const session = await checkout(ctx, {
      payload: {
        product_cart: [{ product_id: productIdForPlan(args.plan), quantity: 1 }],
        return_url: args.returnUrl,
        billing_currency: "USD",
        customer: {
          email: user.email ?? "",
          name: (user.email ?? "").split("@")[0],
          ...(user.customerId ? { customer_id: user.customerId } : {}),
        },
      },
    });

    if (!session?.checkout_url) throw new Error("No checkout URL returned");
    return { checkoutUrl: session.checkout_url };
  },
});

export const getCustomerPortalUrl = action({
  args: {},
  handler: async (_ctx, _args) => {
    throw new Error(
      "Customer portal requires direct Dodo integration. " +
        "Customers can manage subscriptions via the link in their payment confirmation email."
    );
  },
});

export const cancelSubscription = action({
  args: {},
  handler: async (ctx, _args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const userId = identity.subject as Id<"users">;

    const user: { customerId?: string | null } | null = await ctx.runQuery(
      internal.billing.getUserForAction,
      { userId }
    );
    if (!user?.customerId) throw new Error("No active subscription found");

    const portal = await customerPortal(ctx, { send_email: false });
    if (!portal?.portal_url) throw new Error("No portal URL returned");
    return { portalUrl: portal.portal_url };
  },
});

// ─── Internal mutations (called from webhook handler) ─────────────────────────

export const activateSubscription = internalMutation({
  args: {
    email: v.string(),
    plan: v.union(v.literal("solo"), v.literal("pro"), v.literal("agency")),
    subscriptionId: v.string(),
    customerId: v.string(),
    planRenewalDate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      console.error("activateSubscription: no user for email", args.email);
      return;
    }

    await ctx.db.patch(user._id, {
      plan: args.plan,
      subscriptionId: args.subscriptionId,
      customerId: args.customerId,
      planRenewalDate: args.planRenewalDate,
    });
  },
});

export const deactivateSubscription = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      console.error("deactivateSubscription: no user for email", args.email);
      return;
    }

    await ctx.db.patch(user._id, {
      plan: "free",
      subscriptionId: undefined,
      planRenewalDate: undefined,
    });
  },
});

export const logPaymentFailed = internalMutation({
  args: {
    email: v.string(),
    paymentId: v.string(),
    amount: v.number(),
    currency: v.string(),
  },
  handler: async (_ctx, args) => {
    // TODO: trigger Resend alert email to user at args.email
    console.error("Payment failed — alert user:", args);
  },
});
