# Environment Variables Documentation

This document explains all environment variables used in the Real Estate & Maintenance App.

## Required Variables

### Supabase Authentication & Database

These variables are required for the app to function. Get them from your [Supabase Dashboard](https://app.supabase.com).

| Variable | Description | Where to Find | Public/Private |
|----------|-------------|---------------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Project Settings → API → Project URL | Public (client-safe) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | Project Settings → API → Project API keys → anon public | Public (client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (admin access) | Project Settings → API → Project API keys → service_role | **Private (server-only)** |
| `SUPABASE_JWT_SECRET` | JWT secret for token verification | Project Settings → API → JWT Settings | **Private (server-only)** |

### PostgreSQL Database

These are automatically provided by Supabase and can be found in Project Settings → Database → Connection String.

| Variable | Description |
|----------|-------------|
| `POSTGRES_URL` | PostgreSQL connection string (pooled) |
| `POSTGRES_PRISMA_URL` | PostgreSQL connection string for Prisma (with pgbouncer) |
| `POSTGRES_URL_NON_POOLING` | Direct PostgreSQL connection (non-pooled) |
| `POSTGRES_USER` | Database username (usually "postgres") |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DATABASE` | Database name (usually "postgres") |
| `POSTGRES_HOST` | Database host URL |

## Development-Only Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` | Redirect URL for email confirmations in local dev | `http://localhost:3000/dashboard` |

## Optional Variables (Future Integrations)

### Payment Processing

For PayPal and MTN Mobile Money integration:

| Variable | Description |
|----------|-------------|
| `PAYPAL_CLIENT_ID` | PayPal REST API Client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal REST API Secret |
| `MTN_API_KEY` | MTN Mobile Money API Key |
| `MTN_API_SECRET` | MTN Mobile Money API Secret |

### Map Services

If you want to use premium map features:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox access token for advanced maps |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key |

## Setup Instructions

### For Local Development

1. Copy `.env.local.example` to `.env.local`:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

2. Fill in your Supabase credentials from your [Supabase Dashboard](https://app.supabase.com)

3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

### For Production (Vercel)

1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Add all required variables from `.env.example`
4. Supabase integration in Vercel will automatically populate most variables

## Security Notes

- **Never commit `.env.local` or `.env` files to version control**
- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Service role keys and secrets should NEVER be exposed to the client
- Use environment variables for all sensitive data (API keys, database credentials)
- Rotate keys regularly and update them in your deployment platform

## Troubleshooting

### "Supabase client not initialized"
- Check that `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Verify the values are correct in your Supabase dashboard

### "Database connection failed"
- Verify all `POSTGRES_*` variables are set correctly
- Check that your Supabase project is active
- Ensure your IP is not blocked by Supabase

### "Email confirmation not working"
- Set `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` for local development
- Configure redirect URLs in Supabase Dashboard → Authentication → URL Configuration
