import { httpRouter } from "convex/server";
import { createDodoWebhookHandler } from "@dodopayments/convex";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

// Map a Dodo product_id to a LeadPulse plan.
// These env vars must be set in the Convex dashboard (Settings → Environment Variables).
function planFromProductId(
  productId: string
): "solo" | "pro" | "agency" | null {
  if (productId === process.env.DODO_SOLO_PRODUCT_ID) return "solo";
  if (productId === process.env.DODO_PRO_PRODUCT_ID) return "pro";
  if (productId === process.env.DODO_AGENCY_PRODUCT_ID) return "agency";
  return null;
}

http.route({
  path: "/dodopayments-webhook",
  method: "POST",
  handler: createDodoWebhookHandler({
    // ── Subscription activated / renewed ────────────────────────────────────
    onSubscriptionActive: async (ctx, payload) => {
      const { customer, product_id, subscription_id, next_billing_date } =
        payload.data;

      const plan = planFromProductId(product_id);
      if (!plan) {
        console.error("Unknown product_id in subscription webhook:", product_id);
        return;
      }

      await ctx.runMutation(internal.billing.activateSubscription, {
        email: customer.email,
        plan,
        subscriptionId: subscription_id,
        customerId: customer.customer_id,
        planRenewalDate: next_billing_date
          ? new Date(next_billing_date).getTime()
          : undefined,
      });
    },

    onSubscriptionRenewed: async (ctx, payload) => {
      const { customer, product_id, subscription_id, next_billing_date } =
        payload.data;

      const plan = planFromProductId(product_id);
      if (!plan) return;

      await ctx.runMutation(internal.billing.activateSubscription, {
        email: customer.email,
        plan,
        subscriptionId: subscription_id,
        customerId: customer.customer_id,
        planRenewalDate: next_billing_date
          ? new Date(next_billing_date).getTime()
          : undefined,
      });
    },

    // ── Subscription cancelled ───────────────────────────────────────────────
    onSubscriptionCancelled: async (ctx, payload) => {
      await ctx.runMutation(internal.billing.deactivateSubscription, {
        email: payload.data.customer.email,
      });
    },

    onSubscriptionExpired: async (ctx, payload) => {
      await ctx.runMutation(internal.billing.deactivateSubscription, {
        email: payload.data.customer.email,
      });
    },

    // ── Payment failed ───────────────────────────────────────────────────────
    onPaymentFailed: async (ctx, payload) => {
      await ctx.runMutation(internal.billing.logPaymentFailed, {
        email: payload.data.customer.email,
        paymentId: payload.data.payment_id,
        amount: payload.data.total_amount,
        currency: payload.data.currency,
      });
    },
  }),
});

export default http;
