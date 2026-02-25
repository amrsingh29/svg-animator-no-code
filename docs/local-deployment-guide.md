# Local Deployment Guide

Follow these step-by-step instructions to deploy the SVG Animator No-Code application on a new local machine.

## Prerequisites
- **Node.js**: Ensure Node.js (v18 or higher) is installed.
- **Package Manager**: npm, yarn, or pnpm.
- **PostgreSQL**: A running PostgreSQL instance for the database.
- **Git**: To clone the repository.
- **Google Cloud Console Account**: For NextAuth Google OAuth setup.
- **OpenAI/Gemini API Key**: Depending on the AI provider configured in the app for generating SVGs.

## Step 1: Clone the Repository
```bash
git clone https://github.com/amrsingh29/svg-animator-no-code.git
cd svg-animator-no-code
```

## Step 2: Install Dependencies
```bash
npm install
```

## Step 3: Environment Variables Setup
Create a `.env.local` file in the root directory.
```bash
touch .env.local
```
Fill in the necessary variables in `.env.local`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/svg_animator"

# NextAuth
NEXTAUTH_SECRET="your_random_secret_string" # generate with `openssl rand -base64 32`
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# AI Provider
AI_API_KEY="your_ai_api_key_here"
```

## Step 4: Database Setup
Push the Prisma schema to your PostgreSQL database to create the necessary tables:
```bash
npx prisma generate
npx prisma db push
```

## Step 5: Run the Development Server
```bash
npm run dev
```
By default, the application will be available at `http://localhost:3000`.

## Step 6: Verify Deployment
1. Open your browser and navigate to `http://localhost:3000`.
2. Sign in using your Google account to verify NextAuth is working correctly.
3. Access the canvas, create a basic node workflow, and attempt to generate and save an SVG animation to verify that both the AI and Database connections are functioning reliably.
