# Local setup — this machine

What was actually done to get the repo running here (the repo's own guide in `docs/local-deployment-guide.md` is close but assumes a few things that don't hold on macOS with Docker Desktop).

## Instance facts

| Thing | Value |
|---|---|
| Repo | `~/Developer/projects/svg-animator-no-code` |
| App URL | http://localhost:3001 (`npm run dev` hardcodes `next dev -p 3001`) |
| Postgres | Docker container `svg-animator-db`, image `postgres:16`, on `localhost:5432` |
| DB login | user `svguser` / password `svgpass` / database `svg_animator` |
| Env file | `.env` — **not** `.env.local` |

## Two things that differ from the upstream guide

1. **Port is 3001, not 3000.** `package.json` has `"dev": "next dev -p 3001"`. So `NEXTAUTH_URL` must be `http://localhost:3001`, and the Google OAuth redirect URI is `http://localhost:3001/api/auth/callback/google`.
2. **Env file is `.env`.** Next.js and the Prisma CLI both load `.env`; the upstream guide says `.env.local`, which the Prisma CLI ignores — `npx prisma db push` then dies with `P1012: Environment variable not found: DATABASE_URL`.

## Commands

```bash
# start the database (once per boot)
docker start svg-animator-db

# schema -> database
npx prisma generate
npx prisma db push

# run
npm run dev            # http://localhost:3001

# stop the database
docker stop svg-animator-db
```

## Still needs your own credentials

Both go in `.env`, then restart the dev server.

- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — https://console.cloud.google.com/apis/credentials → Create credentials → OAuth client ID → Web application. Authorised redirect URI: `http://localhost:3001/api/auth/callback/google`. Without these, "Log in with Google" fails at the Google screen and every authenticated page redirects to `/`.
- `GEMINI_API_KEY` — https://aistudio.google.com/apikey. Without it, `/api/animate` returns `Missing GEMINI_API_KEY. Please set it in Settings.`

The app also accepts a per-browser key: paste it into the in-app Settings modal, which stores it in `localStorage` under `gemini_api_key` and sends it in the request body. That takes precedence over `GEMINI_API_KEY`.

## Model: moved off gemini-2.5-flash

The repo pinned `gemini-2.5-flash`. That model is deprecated, and from **1 December 2026** the API silently reroutes requests for it to `gemini-3.5-flash-lite` and bills at those rates. Google's documented replacement is `gemini-3.8-flash`, so the pin now points there.

All five modes — animate, morph, generate-svg, image-to-svg, icon-library — go through one call in `src/app/api/animate/route.ts`, so this is the only place a model is named.

```ts
model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
config: {
    systemInstruction,
    thinkingConfig: { thinkingLevel: ThinkingLevel.MEDIUM },
}
```

Two changes were forced by the jump, not chosen:

- **`temperature` had to go.** From Gemini 3.6 onward `temperature`, `top_p` and `top_k` are deprecated — ignored today, HTTP 400 in future generations. The old code leaned on `temperature: 0.1` for stable XML, so that job now rests entirely on the system instruction. Fortunately it already does the real work here: the scoped-ID CSS rule, the raw-`<svg>`-only rule, "preserve original paths and viewBox".
- **Thinking is a level, not a budget.** `thinking_budget` is replaced by `thinking_level`, and `minimal` is rejected on 3.8 Flash. Set to `medium` (the default): `low` is faster but sloppier on path geometry, `high` burns tokens on what is a constrained transform task.

`ThinkingLevel` is a TypeScript enum in `@google/genai`, not a string union — `'medium'` fails typecheck, it has to be `ThinkingLevel.MEDIUM`. That's the import at the top of the route.

### Switching models

`GEMINI_MODEL` overrides the default without touching code:

```env
GEMINI_MODEL="gemini-3.6-flash"
```

Restart the dev server after changing it. If a model string is wrong or unavailable on your key, the route returns 500 with Google's raw error JSON in the body.

## Verified

- `/` → 200, landing page renders
- `/login` → 200
- `/projects`, `/dashboard` → 307 to `/` (correct: unauthenticated)
- `POST /api/animate` with no key → `{"error":"Missing GEMINI_API_KEY..."}` (route reachable, request validated)
- `POST /api/animate` with a bogus key → upstream `API_KEY_INVALID` from Google (network path to Gemini works)
- After the model change: `tsc -p tsconfig.json --noEmit` clean, server hot-reloads, `/` still 200, and the bogus-key call still returns `API_KEY_INVALID` — so `gemini-3.8-flash` and `thinkingConfig` are accepted by the request path
- All 5 Prisma tables created

Not verified: a real generation. That needs a live `GEMINI_API_KEY`, still blank.

## Notes

- `npm install` reports 18 production vulnerabilities, including criticals in `next` (request smuggling in rewrites), `next-auth`/`@auth/core` (email homoglyph bypass) and `protobufjs`. Nothing here is exposed publicly, but don't point a tunnel at this before upgrading.
- The repo ships `test-duplicates.js` / `test-duplicates.ts` at the root — leftover probes for the save-dedup logic, not a test suite. There is no test runner configured.
- `package-lock.json` shows as modified after install (npm rewrote it). Harmless, but it means `git pull` may complain later; `git checkout package-lock.json` if you want a clean tree.
