import { defineApp } from "convex/server";
import dodopayments from "@dodopayments/convex/convex.config";
import resend from "@convex-dev/resend/convex.config.js";

const app = defineApp();
app.use(dodopayments);
app.use(resend);

export default app;
