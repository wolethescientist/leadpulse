import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import Google from "@auth/core/providers/google";
import GitHub from "@auth/core/providers/github";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Google, GitHub],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        return args.existingUserId;
      }
      return await ctx.db.insert("users", {
        email: args.profile.email,
        name: args.profile.name,
        image: args.profile.pictureUrl,
        plan: "free",
        instantAlerts: false,
        timezone: "UTC",
        onboardingCompleted: false,
        wizardCompleted: false,
        dismissedFlags: [],
      });
    },
  },
});
