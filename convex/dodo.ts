import { DodoPayments, DodoPaymentsClientConfig } from "@dodopayments/convex";
import { components } from "./_generated/api";

// Note: identify returns null because this project uses Better Auth (not Convex JWT auth).
// ctx.auth.getUserIdentity() is always null in our setup.
// Customer linkage is handled by storing customerId from webhooks → users.customerId.
export const dodo = new DodoPayments(components.dodopayments, {
  identify: async (_ctx) => null,
  // Guard runs at call-time (not module load), so Convex can analyze the module
  // before the env var is set in the dashboard.
  get apiKey() {
    const key = process.env.DODO_PAYMENTS_API_KEY;
    if (!key) throw new Error("DODO_PAYMENTS_API_KEY is not set in Convex environment variables");
    return key;
  },
  environment: (process.env.DODO_PAYMENTS_ENVIRONMENT ?? "test_mode") as
    | "test_mode"
    | "live_mode",
} as DodoPaymentsClientConfig);

export const { checkout, customerPortal } = dodo.api();
