# MenuIQ

A modern dashboard for restaurant owners to analyze and understand their Google Reviews using AI-powered sentiment analysis.

## Features

- Google Places API integration for restaurant data and reviews
- Real-time sentiment analysis of reviews
- Trend analysis and keyword extraction
- Modern, responsive UI built with Next.js and Tailwind CSS
- Secure authentication with NextAuth.js
- Data persistence with Supabase

## Tech Stack

- **Frontend**: Next.js 15.3, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase
- **Authentication**: NextAuth.js
- **APIs**: Google Places API, OpenAI API
- **Deployment**: Vercel

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env.local`
4. Run the development server: `npm run dev`

## Environment Variables

Required environment variables:
```
NEXTAUTH_SECRET
NEXTAUTH_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GOOGLE_PLACES_API_KEY
OPENAI_API_KEY
```

## License

MIT
