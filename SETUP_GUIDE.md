# 🚀 Quick Setup Guide

## Step 1: Add Your API Key

1. Open the `.env` file in the root folder
2. Replace `your_api_key_here` with your actual Gemini API key

```env
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```

**Get your API key**: https://aistudio.google.com/app/apikey

## Step 2: Start the Server

```bash
npm run dev
```

## Step 3: Open in Browser

Go to: http://localhost:3000

## ✅ What I Fixed

The app was trying to call the AI directly from the browser (which doesn't work). Now it properly uses server-side API routes:

- ✅ `/api/generate` - Idea generation
- ✅ `/api/validate` - Deep validation  
- ✅ `/api/market` - Market research
- ✅ `/api/execution` - Execution plan

## 🔧 Troubleshooting

**Still seeing errors?**

1. Make sure your API key is correct in `.env`
2. Restart the dev server after adding the key (Ctrl+C, then `npm run dev`)
3. Check the terminal for error messages
4. Open browser console (F12) to see detailed errors

**API Key Issues?**
- Get a new key from: https://aistudio.google.com/app/apikey
- Make sure there are no spaces before/after the key
- The key should start with `AIza`

## 📝 Test Checklist

Once running, test each feature:

- [ ] Idea Generation (fill all 3 fields)
- [ ] Deep Validation (enter an idea)
- [ ] Market Research (enter an idea)
- [ ] Execution Plan (enter an idea)

All should work now! 🎉
