export type Plan = "free" | "solo" | "pro" | "agency";

export function getKeywordLimit(plan: Plan): number {
  switch (plan) {
    case "free": return 3;
    case "solo": return 10;
    case "pro": return Infinity;
    case "agency": return Infinity;
  }
}

export function getLeadLimit(plan: Plan): number {
  switch (plan) {
    case "free": return 10;
    case "solo": return 50;
    case "pro": return Infinity;
    case "agency": return Infinity;
  }
}

export function hasInstantAlerts(plan: Plan): boolean {
  return plan === "pro" || plan === "agency";
}

export function hasAIReply(plan: Plan): boolean {
  return plan === "pro" || plan === "agency";
}

export function hasSlack(plan: Plan): boolean {
  return plan === "solo" || plan === "pro" || plan === "agency";
}

export function hasTeamSeats(plan: Plan): boolean {
  return plan === "agency";
}
