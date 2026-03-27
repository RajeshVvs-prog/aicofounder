# 🚀 Deploy to Vercel

## Prerequisites
- GitHub account
- Vercel account (free at https://vercel.com)
- Groq API key

## Step-by-Step Deployment

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3. Add Environment Variable

In Vercel project settings:
1. Go to "Settings" → "Environment Variables"
2. Add:
   - **Name**: `GROQ_API_KEY`
   - **Value**: `gsk_YourGroqAPIKeyHere`
   - **Environment**: Production, Preview, Development

### 4. Deploy

Click "Deploy" and wait for build to complete!

## Your App Structure

```
/api/generate.js    → Serverless function for idea generation
/api/validate.js    → Serverless function for validation
/api/market.js      → Serverless function for market research
/api/execution.js   → Serverless function for execution plan
/dist/              → Built frontend (auto-generated)
```

## After Deployment

Your app will be live at: `https://your-project.vercel.app`

## Troubleshooting

### Build fails
- Check that `groq-sdk` is in `dependencies` (not `devDependencies`)
- Verify `vercel-build` script exists in package.json

### API errors
- Make sure `GROQ_API_KEY` is set in Vercel environment variables
- Check function logs in Vercel dashboard

### CORS errors
- API routes already have CORS headers configured
- If issues persist, check Vercel function logs

## Local Testing Before Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Run locally with Vercel
vercel dev
```

This will simulate the Vercel environment locally!

## Custom Domain (Optional)

1. Go to Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

---

## Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] `GROQ_API_KEY` environment variable added
- [ ] Deployment successful
- [ ] Test all features on live site

Your AI Co-founder app is now live! 🎉
