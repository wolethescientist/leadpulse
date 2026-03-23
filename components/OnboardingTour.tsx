"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import "driver.js/dist/driver.css";

interface OnboardingTourProps {
  onboardingCompleted: boolean;
  wizardCompleted: boolean;
}

export function OnboardingTour({
  onboardingCompleted,
  wizardCompleted,
}: OnboardingTourProps) {
  const started = useRef(false);
  const completeOnboarding = useMutation(api.onboarding.completeOnboarding);

  useEffect(() => {
    if (!wizardCompleted) return;
    if (onboardingCompleted) return;
    if (started.current) return;
    started.current = true;

    async function markDone() {
      await completeOnboarding({});
    }

    // Dynamic import to avoid SSR issues
    import("driver.js").then(({ driver }) => {
      const driverObj = driver({
        animate: true,
        overlayOpacity: 0.55,
        showProgress: true,
        allowClose: true,
        steps: [
          {
            popover: {
              title: "Welcome to LeadPulse 👋",
              description:
                "Let&rsquo;s take a quick tour so you can start landing clients faster.",
              side: "over" as never,
              align: "center",
            },
          },
          {
            element: "#tour-feed",
            popover: {
              title: "Your lead feed",
              description:
                "Scored leads appear here in real time as they match your keywords.",
              side: "top",
              align: "start",
            },
          },
          {
            element: "#tour-filter-bar",
            popover: {
              title: "Filter your leads",
              description:
                "Filter by status, source, or sort by score to find the best opportunities.",
              side: "bottom",
              align: "start",
            },
          },
          {
            element: "#tour-lead-card",
            popover: {
              title: "Each card shows a score and intent signals",
              description:
                "The score (0–100) tells you how likely this person is hiring. Intent signals help you qualify fast.",
              side: "right",
              align: "start",
            },
          },
          {
            element: "#tour-draft-reply",
            popover: {
              title: "Draft a reply in seconds",
              description:
                "Pro plan users can generate a personalised outreach reply with one click.",
              side: "top",
              align: "start",
            },
          },
          {
            element: "#tour-sidebar-stats",
            popover: {
              title: "Track your pipeline",
              description:
                "Your total leads, new today, and average score live here in the sidebar.",
              side: "right",
              align: "start",
            },
          },
          {
            element: "#tour-billing-link",
            popover: {
              title: "Turn on instant alerts",
              description:
                "Upgrade to Pro or Agency to get instant Slack alerts the moment a high-score lead lands.",
              side: "right",
              align: "start",
            },
          },
          {
            popover: {
              title: "You're all set 🎉",
              description:
                "Your first leads are on their way. Check back soon — or upgrade for real-time alerts.",
              side: "over" as never,
              align: "center",
            },
          },
        ],
        onDestroyStarted: () => {
          void markDone();
        },
      });

      // Small delay so the dashboard has rendered
      setTimeout(() => driverObj.drive(), 800);
    });
  }, [onboardingCompleted, wizardCompleted]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
