# Foundr

## Setup

1. Clone/download this project
2. Install dependencies: `npm install`
3. Copy `.env.local.example` to `.env.local` and fill in your credentials
4. Run the SQL schema in your Supabase project: copy `schema.sql` contents → Supabase SQL Editor → Run
5. Enable Google OAuth in Supabase: Authentication → Providers → Google
6. Start dev server: `npm run dev`
7. Open http://localhost:3000

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + Shadcn/UI
- Supabase (PostgreSQL + Auth + Realtime)
- Framer Motion
- Google Gemini AI
