"use client";

import { useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import "driver.js/dist/driver.css";

interface FeatureSpotlightProps {
  dismissedFlags: string[];
}

export function FeatureSpotlight({
  dismissedFlags,
}: FeatureSpotlightProps) {
  const started = useRef<string | null>(null);
  const activeFlags = useQuery(api.onboarding.getActiveFeatureFlags);
  const dismissFlag = useMutation(api.onboarding.dismissFlag);

  useEffect(() => {
    if (!activeFlags) return;

    const undismissed = activeFlags.filter(
      (f) => !dismissedFlags.includes(f.key)
    );

    if (undismissed.length === 0) return;

    const flag = undismissed[0];
    if (started.current === flag.key) return;
    started.current = flag.key;

    const el = document.querySelector(flag.targetEl);

    import("driver.js").then(({ driver }) => {
      const driverObj = driver({
        animate: true,
        overlayOpacity: 0.5,
        allowClose: true,
        steps: [
          {
            element: el ?? undefined,
            popover: {
              title: flag.label,
              description: "Click anywhere outside or press Escape to dismiss.",
              side: "bottom",
              align: "start",
            },
          },
        ],
        onDestroyStarted: () => {
          void dismissFlag({ flagKey: flag.key });
        },
      });

      setTimeout(() => driverObj.drive(), 400);
    });
  }, [activeFlags, dismissedFlags]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
