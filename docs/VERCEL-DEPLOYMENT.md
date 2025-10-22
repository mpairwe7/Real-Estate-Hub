# Vercel Deployment Guide

## Overview

This guide walks you through deploying your Real Estate Hub application to Vercel with automated CI/CD deployments from GitHub.

## Prerequisites

✅ GitHub repository: `mpairwe7/Real-Estate-Hub`  
✅ Vercel account (free tier available)  
✅ Vercel CLI installed locally (`npm install -g vercel`)

## Current Vercel Project Details

Based on your `.vercel/project.json` file:

```json
{
  "projectId": "prj_XDKVvVJ8hIpQ7zCjQIxKdWy37qXO",
  "orgId": "team_vrMPsQ2NWc58UUpzqt4gudro"
}
```

## Step 1: Get Vercel Token

### Option A: Using Vercel Dashboard (Recommended)

1. Go to **[Vercel Account Settings](https://vercel.com/account/tokens)**
2. Click **Create Token**
3. Enter a descriptive name: `GitHub Actions - Real Estate Hub`
4. Set scope: **Full Account** (or select specific projects)
5. Set expiration: **No Expiration** (or custom duration)
6. Click **Create**
7. **COPY THE TOKEN IMMEDIATELY** (you won't see it again!)

### Option B: Using Vercel CLI

```bash
# Login to Vercel
vercel login

# The token is stored in ~/.vercel/auth.json
cat ~/.vercel/auth.json | grep token
```

## Step 2: Add GitHub Secrets

Go to: **https://github.com/mpairwe7/Real-Estate-Hub/settings/secrets/actions**

Click **New repository secret** and add these **3 required secrets**:

### 1. VERCEL_TOKEN
- **Name:** `VERCEL_TOKEN`
- **Value:** Your token from Step 1 (starts with `vercel_...`)
- Example: `vercel_xxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. VERCEL_ORG_ID
- **Name:** `VERCEL_ORG_ID`
- **Value:** `team_vrMPsQ2NWc58UUpzqt4gudro`

### 3. VERCEL_PROJECT_ID
- **Name:** `VERCEL_PROJECT_ID`
- **Value:** `prj_XDKVvVJ8hIpQ7zCjQIxKdWy37qXO`

## Step 3: Add Environment Variables to Vercel

You need to add your environment variables to Vercel so the deployed app works correctly.

### Option A: Using Vercel Dashboard

1. Go to your project: **https://vercel.com/dashboard**
2. Select **Real Estate Hub** project
3. Go to **Settings** → **Environment Variables**
4. Add each variable below for **Production**, **Preview**, and **Development**:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://icvlkfwzppohmvfmfxwr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljdmxrZnd6cHBvaG12Zm1meHdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzA3MjcsImV4cCI6MjA3NTcwNjcyN30.zxMrwqYOk-z-nnyRpc25AY0cjZud2Cz4pW7P45b4pOc

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAKWUxwqpyx1KncjiMDmJz5BfVCU9m1a5Y
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=mernapp-6e488.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=mernapp-6e488
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=mernapp-6e488.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=536088247858
NEXT_PUBLIC_FIREBASE_APP_ID=1:536088247858:web:361e7040eb5130f75e462b

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyA5ZFqQy1Lmbmkvd9M7ntB-cm0SqRir4fU
```

### Option B: Using Vercel CLI (Faster)

```bash
# Navigate to your project
cd /home/darkhorse/Documents/real-estate-app

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://icvlkfwzppohmvfmfxwr.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste the key...

# Repeat for all variables listed above
```

## Step 4: Test Deployment

### Manual Deployment (Test First)

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Trigger Automated Deployment

Once GitHub secrets are added, push to trigger deployment:

```bash
git commit --allow-empty -m "chore: trigger Vercel deployment"
git push origin trunk
```

The CI/CD pipeline will:
1. ✅ Run tests
2. ✅ Build the application
3. ✅ Deploy to Vercel production

## Step 5: Monitor Deployment

### GitHub Actions
- View workflow: https://github.com/mpairwe7/Real-Estate-Hub/actions
- The "Deploy to Vercel" job will now run successfully

### Vercel Dashboard
- View deployments: https://vercel.com/dashboard
- Check logs, domains, and analytics

## Deployment Workflow

### How It Works

```mermaid
graph LR
    A[Push to trunk/main] --> B[GitHub Actions]
    B --> C[Run Tests]
    C --> D[Build App]
    D --> E[Deploy to Vercel]
    E --> F[Live on Vercel]
```

### Automatic Deployments

- **Production:** Pushes to `main` or `trunk` branch
- **Preview:** Pull requests automatically get preview URLs
- **Rollback:** Available in Vercel dashboard

## Custom Domain (Optional)

### Add Custom Domain

1. Go to Vercel project → **Settings** → **Domains**
2. Add your domain: `yourdomain.com`
3. Update DNS records as instructed by Vercel
4. SSL certificate is automatically provisioned

### Update Firebase/Supabase Redirects

Update your authorized domains in:
- **Firebase Console:** Authentication → Settings → Authorized domains
- **Supabase Dashboard:** Authentication → URL Configuration

## Troubleshooting

### Deployment Fails with "Missing Token"

**Issue:** `Error: Input required and not supplied: vercel-token`

**Solution:**
1. Verify `VERCEL_TOKEN` secret is added to GitHub
2. Check token hasn't expired
3. Regenerate token if needed

### Build Succeeds but Deployment Skipped

**Issue:** Deploy job is skipped in GitHub Actions

**Solution:**
The deploy job only runs if:
- Branch is `main` or `trunk`
- `VERCEL_TOKEN` secret exists
- Build and Test jobs pass

Check the job condition in `.github/workflows/ci-cd.yml`:
```yaml
if: (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/trunk') && secrets.VERCEL_TOKEN != ''
```

### Environment Variables Not Working

**Issue:** App deployed but features don't work (Firebase, Supabase, etc.)

**Solution:**
1. Check Vercel dashboard → Settings → Environment Variables
2. Ensure variables are set for **Production** environment
3. Redeploy after adding variables: `vercel --prod`

### Deployment Success but Site Shows Error

**Issue:** Build succeeds but site shows 500 error

**Solution:**
1. Check Vercel logs: Project → Deployments → Click deployment → Logs
2. Verify all environment variables are correct
3. Check for missing dependencies in `package.json`
4. Ensure Node.js version compatibility (20.x)

## Deployment Commands Reference

```bash
# Local deployment commands
vercel login                    # Login to Vercel
vercel                         # Deploy to preview
vercel --prod                  # Deploy to production
vercel ls                      # List deployments
vercel logs                    # View deployment logs
vercel env ls                  # List environment variables
vercel env add VAR_NAME prod   # Add environment variable
vercel alias                   # Manage domain aliases

# GitHub Actions (automatic)
git push origin trunk          # Triggers production deployment
git push origin main           # Triggers production deployment
# Pull requests trigger preview deployments automatically
```

## Security Best Practices

✅ **DO:**
- Use Vercel's environment variables (encrypted at rest)
- Set different values for Production/Preview/Development
- Rotate tokens regularly
- Use least-privilege scopes for tokens
- Enable Vercel's security headers

❌ **DON'T:**
- Commit `.vercel` folder to git (already in .gitignore)
- Share Vercel tokens publicly
- Use production credentials in preview deployments
- Disable HTTPS (always use HTTPS)

## Monitoring & Analytics

### Built-in Vercel Features

- **Analytics:** Real-time visitor analytics (free tier: 100k events/month)
- **Logs:** Function execution logs and errors
- **Performance:** Web Vitals monitoring
- **Security:** DDoS protection and SSL/TLS

### Enable Analytics

1. Go to Vercel project → **Analytics**
2. Click **Enable Analytics**
3. View metrics in real-time

## Cost Estimation

### Vercel Free Tier (Hobby)

- ✅ **Bandwidth:** 100 GB/month
- ✅ **Deployments:** Unlimited
- ✅ **Serverless Functions:** 100 GB-hours
- ✅ **Edge Functions:** 500k invocations
- ✅ **Domains:** Unlimited
- ✅ **Team Members:** 1 (just you)

### When to Upgrade

Consider Vercel Pro ($20/month) if:
- Traffic exceeds 100 GB/month
- Need team collaboration
- Require password protection
- Want advanced analytics

## Next Steps

1. ✅ Add the 3 Vercel secrets to GitHub
2. ✅ Add environment variables to Vercel
3. ✅ Push to trigger deployment
4. ✅ Verify deployment at your Vercel URL
5. ⏸️ (Optional) Add custom domain
6. ⏸️ (Optional) Enable Vercel Analytics

## Useful Links

- **Your Vercel Dashboard:** https://vercel.com/dashboard
- **Your GitHub Actions:** https://github.com/mpairwe7/Real-Estate-Hub/actions
- **Vercel Documentation:** https://vercel.com/docs
- **Next.js on Vercel:** https://vercel.com/docs/frameworks/nextjs

## Support

- Vercel Support: support@vercel.com
- Vercel Community: https://github.com/vercel/vercel/discussions
- Next.js Discord: https://nextjs.org/discord
