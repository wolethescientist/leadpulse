# Environment Variables Setup

This doc covers every env var needed to run LeadPulse locally and in production.

---

## `.env.local` (Next.js — never commit this file)

### Convex (auto-populated by `npx convex dev`)
| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Auto-set by Convex CLI |
| `CONVEX_DEPLOYMENT` | Auto-set by Convex CLI |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | Auto-set by Convex CLI |

### Internal Sync Secret
| Variable | How to get |
|---|---|
| `CONVEX_SYNC_SECRET` | `openssl rand -base64 32` — also set in Convex dashboard |

### Dodo Payments — https://dodopayments.com/dashboard
| Variable | Notes |
|---|---|
| `DODO_PAYMENTS_API_KEY` | API key from Dodo dashboard — also set in Convex dashboard |
| `DODO_PAYMENTS_ENVIRONMENT` | `test_mode` (dev) or `live_mode` (prod) — also set in Convex dashboard |
| `DODO_WEBHOOK_SECRET` | From Dodo webhook settings — also set in Convex dashboard |
| `DODO_SOLO_PRODUCT_ID` | Product ID for Solo plan — also set in Convex dashboard |
| `DODO_PRO_PRODUCT_ID` | Product ID for Pro plan — also set in Convex dashboard |
| `DODO_AGENCY_PRODUCT_ID` | Product ID for Agency plan — also set in Convex dashboard |

### Reddit OAuth — https://www.reddit.com/prefs/apps
Use **script** app type. Also set all four in Convex dashboard.

| Variable | Notes |
|---|---|
| `REDDIT_CLIENT_ID` | From Reddit app settings |
| `REDDIT_CLIENT_SECRET` | From Reddit app settings |
| `REDDIT_USERNAME` | Reddit account username used for the script app |
| `REDDIT_PASSWORD` | Reddit account password |

### AI / Scoring
| Variable | How to get | Also in Convex? |
|---|---|---|
| `GEMINI_API_KEY` | https://aistudio.google.com/apikey | Yes |
| `GROQ_API_KEY` | https://console.groq.com/keys | Yes |

### Email
| Variable | How to get | Also in Convex? |
|---|---|---|
| `RESEND_API_KEY` | https://resend.com/api-keys | Yes |

### App URL
| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` (dev) / `https://leadpulse.app` (prod) — also set in Convex dashboard |

---

## Convex Dashboard (Settings → Environment Variables)

These must be set in the Convex dashboard — Convex server functions read from the dashboard, not from `.env.local`.

```bash
npx convex env set VARIABLE_NAME value
```

### Convex Auth (OAuth handled entirely by Convex — NOT in .env.local)
| Variable | How to get |
|---|---|
| `JWT_PRIVATE_KEY` | Auto-generated: `npx @convex-dev/auth` setup, or paste from Convex auth docs |
| `SITE_URL` | `http://localhost:3000` (dev) / `https://leadpulse.app` (prod) |
| `AUTH_GOOGLE_ID` | Google Cloud Console → OAuth 2.0 credentials — Callback: `{CONVEX_SITE_URL}/api/auth/callback/google` |
| `AUTH_GOOGLE_SECRET` | Google Cloud Console → OAuth 2.0 credentials |
| `AUTH_GITHUB_ID` | GitHub developer settings — Callback: `{CONVEX_SITE_URL}/api/auth/callback/github` |
| `AUTH_GITHUB_SECRET` | GitHub developer settings |

### Everything else
| Variable | Source |
|---|---|
| `CONVEX_SITE_URL` | Auto-set — `https://astute-manatee-418.eu-west-1.convex.site` |
| `CONVEX_SYNC_SECRET` | Same value as `.env.local` |
| `DODO_PAYMENTS_API_KEY` | Same as `.env.local` |
| `DODO_PAYMENTS_ENVIRONMENT` | `test_mode` or `live_mode` |
| `DODO_WEBHOOK_SECRET` | Same as `.env.local` |
| `DODO_SOLO_PRODUCT_ID` | Same as `.env.local` |
| `DODO_PRO_PRODUCT_ID` | Same as `.env.local` |
| `DODO_AGENCY_PRODUCT_ID` | Same as `.env.local` |
| `REDDIT_CLIENT_ID` | Same as `.env.local` |
| `REDDIT_CLIENT_SECRET` | Same as `.env.local` |
| `REDDIT_USERNAME` | Same as `.env.local` |
| `REDDIT_PASSWORD` | Same as `.env.local` |
| `GEMINI_API_KEY` | Same as `.env.local` |
| `GROQ_API_KEY` | Same as `.env.local` |
| `RESEND_API_KEY` | Same as `.env.local` |
| `NEXT_PUBLIC_APP_URL` | `https://leadpulse.app` (prod) |

---

## Quick setup for local dev

```bash
# 1. Generate secrets
openssl rand -base64 32   # use for CONVEX_SYNC_SECRET

# 2. Fill in .env.local with all values above

# 3. Push Convex env vars
npx convex env set CONVEX_SYNC_SECRET <value>
npx convex env set CONVEX_SITE_URL https://astute-manatee-418.eu-west-1.convex.site
npx convex env set DODO_PAYMENTS_API_KEY <value>
# ... etc

# 4. Start dev
npx convex dev &
npm run dev
```
