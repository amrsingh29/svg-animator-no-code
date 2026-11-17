# Local Deployment Guide

How to get the app running on your own machine. Takes about twenty minutes, most of it spent in two Google consoles.

## Prerequisites

- **Node.js 18+** (`node -v` to check)
- **PostgreSQL**, either a local install or Docker. The steps below use Docker because it avoids installing Postgres system-wide.
- **Git**
- **A Google Cloud project** for the OAuth login
- **A Gemini API key** for AI generation

Two things that catch people out on a fresh setup:

1. The dev server runs on port **3001**, not 3000. `package.json` sets `"dev": "next dev -p 3001"`. Every URL and redirect URI in this guide uses 3001 for that reason.
2. The env file has to be **`.env`**, not `.env.local`. Next.js reads either, but the Prisma CLI only reads `.env`, so `npx prisma db push` fails with `P1012: Environment variable not found: DATABASE_URL` if you name it `.env.local`.

## Step 1: clone and install

```bash
git clone https://github.com/amrsingh29/svg-animator-no-code.git
cd svg-animator-no-code
npm install
```

## Step 2: PostgreSQL

With Docker:

```bash
docker run -d --name svg-animator-db \
  -e POSTGRES_USER=svguser \
  -e POSTGRES_PASSWORD=svgpass \
  -e POSTGRES_DB=svg_animator \
  -p 5432:5432 \
  postgres:16
```

That container stays around after you stop it; `docker start svg-animator-db` brings it back on later boots.

Or use an existing Postgres instance and skip to the connection string. Either way you need a database and a user that can create tables in it.

## Step 3: environment variables

Create `.env` in the repo root:

```env
# Database
DATABASE_URL="postgresql://svguser:svgpass@localhost:5432/svg_animator?schema=public"

# NextAuth
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3001"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Gemini
GEMINI_API_KEY=""

# Optional: override the model (defaults to gemini-3.8-flash)
# GEMINI_MODEL="gemini-3.6-flash"
```

Generate the secret:

```bash
openssl rand -base64 32
```

For a managed Postgres (Neon, Supabase, RDS), paste the provider's connection string into `DATABASE_URL` and keep the `?schema=public` parameter or add it.

## Step 4: create the tables

```bash
npx prisma generate
npx prisma db push
```

You should see `Your database is now in sync with your Prisma schema`. Five tables get created: `User`, `Account`, `Session`, `VerificationToken`, `SavedSVG`.

## Step 5: Google OAuth client

Sign-in is Google-only, so the app is unusable without these two values.

**a. Create a project.** Open https://console.cloud.google.com and use the project selector in the top bar → **New project**. Name it anything; make sure the selector shows it before continuing.

**b. Configure the consent screen.** Go to **APIs & Services → OAuth consent screen**. Newer consoles route this through a Google Auth Platform wizard; take the **Get started** path if you see it.

- User type: **External** (use Internal only for a Workspace org)
- App name: `SVG Animator`
- Support email and developer contact: your address
- Scopes: leave the defaults. `openid`, `email` and `profile` are all NextAuth asks for, and none require review.

**c. Add a test user.** Under **Audience → Test users → Add users**, add your own Gmail address. While the app is in Testing status, only listed accounts can sign in. An unlisted account gets an error that looks like a broken app, when the real cause is permissions.

**d. Create the client.** **APIs & Services → Credentials → Create credentials → OAuth client ID**.

- Application type: **Web application**
- Authorized JavaScript origins: `http://localhost:3001`
- Authorized redirect URIs: `http://localhost:3001/api/auth/callback/google`

The redirect URI must match exactly: `http` not `https`, port `3001`, no trailing slash, `localhost` not `127.0.0.1`.

**e. Copy the values.** The dialog shows a Client ID ending in `.apps.googleusercontent.com` and a Client secret starting `GOCSPX-`. Put them in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. The secret is only shown once.

## Step 6: Gemini API key

This is the only AI provider the app supports. There is no OpenAI or Anthropic path in the code.

**a. Get a key.** Go to https://aistudio.google.com/apikey and sign in with the same Google account.

**b. Create it.** Click **Create API key**. If you already have a Cloud project, pick it from the dropdown; otherwise AI Studio creates one for you. Copy the key; it starts with `AIza`.

**c. Decide free or paid.** The free tier works for trying this out, with lower rate limits and one condition worth knowing: on the free tier Google may use your prompts to improve its products. Paid tier does not. For a demo app the free tier is fine.

**d. Enable billing if you want the paid tier.** AI Studio → the project → **Set up Billing**, which links to the Cloud console. As of writing, `gemini-3.8-flash` costs $0.75 per million input tokens and $3.75 per million output through 31 December 2026, doubling after that. A single SVG generation is a few thousand tokens, so a demo session costs cents.

**e. Put it in `.env`** as `GEMINI_API_KEY`. Alternatively, skip the env var and paste the key into the app's own Settings dialog. That stores it in browser `localStorage` under `gemini_api_key` and sends it with each request, taking precedence over the server-side value. Useful for a shared machine; less good for anything you deploy, because the key travels from the browser.

If the key is missing, `/api/animate` returns `Missing GEMINI_API_KEY. Please set it in Settings.` If it's present but wrong, Google returns `API_KEY_INVALID` and the route passes that through as a 500.

## Step 7: run it

```bash
npm run dev
```

Open **http://localhost:3001**. You should get the landing page with a Log in button.

## Step 8: verify

Work through these in order. Each one proves a different piece:

1. **Landing page loads** at `/`. If the page renders but styles look broken, the CSS didn't compile; check the terminal for errors.
2. **Google login works.** Click Log in, pick your account, and you should land back on the canvas. A redirect to `/api/auth/signin?error=OAuthSignin` means `GOOGLE_CLIENT_ID` is empty or the redirect URI doesn't match.
3. **An authenticated page loads.** `/projects` should show an empty projects list, not bounce you to `/`.
4. **Generation works.** On the canvas, use the Template Gallery node → Load Template (Geometric Robot), type a prompt into Text Prompt like *"make it pulse and rotate"*, connect both to AI Generation, and hit Generate Animation. The Rendered Result node should fill with an animated SVG within a few seconds.
5. **Saving works.** Save the project, then check `/projects`; it should be listed. Reopen it and confirm the nodes come back.

## Troubleshooting

| Symptom | Cause |
|---|---|
| `P1012: Environment variable not found: DATABASE_URL` | Env file is named `.env.local`. Rename to `.env`. |
| `client_id is required` and a bounce to `error=OAuthSignin` | `GOOGLE_CLIENT_ID` is empty. |
| Google says `redirect_uri_mismatch` | The redirect URI in the console doesn't exactly match `http://localhost:3001/api/auth/callback/google`. |
| Google says the app hasn't been verified / access blocked | Your account isn't on the consent screen's test user list. |
| `Missing GEMINI_API_KEY` | No key in `.env` and none saved in the Settings dialog. |
| `API_KEY_INVALID` | Key is wrong, or was revoked after being copied. |
| Everything 500s after changing `.env` | The dev server reads env at boot. Restart it. |
| `port 3001 already in use` | Something else is on 3001. `lsof -nP -iTCP:3001 -sTCP:LISTEN` to find it. |

## Deploying elsewhere

Two things break outside localhost:

- `NEXTAUTH_URL` must be the public URL, and the Google redirect URI must be `https://your-domain/api/auth/callback/google`.
- The build runs `prisma generate` via `postinstall`, so the host needs `DATABASE_URL` available at build time, not just runtime.

`npm audit` reports known vulnerabilities in transitive dependencies, including criticals in `next`, `next-auth` and `protobufjs`. Fine behind localhost; upgrade before exposing it publicly.
