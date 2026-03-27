# 🔑 How to Get a Working Gemini API Key

## The Problem:
Your API key is showing as "not valid" which means it wasn't set up correctly.

## Solution - Get API Key from Google AI Studio:

### Step 1: Go to Google AI Studio
https://aistudio.google.com/app/apikey

### Step 2: Sign in with Google Account
Make sure you're signed in

### Step 3: Create API Key
1. Click "Create API key" button
2. Choose "Create API key in new project" (recommended)
3. Wait for it to generate
4. Copy the ENTIRE key (it's long, around 39 characters)

### Step 4: Verify the Key Format
The key should look like:
```
AIzaSyABC123def456GHI789jkl012MNO345pqr
```
- Starts with `AIza`
- About 39 characters long
- No spaces, no quotes

### Step 5: Update backend/.env
Open `backend/.env` and paste:
```
GEMINI_API_KEY=YourActualKeyHere
```

### Step 6: Save and Test
1. Save the file (Ctrl+S)
2. Run: `node test-key.cjs`
3. Should see "✅ SUCCESS!"

---

## Alternative: Use Google Cloud Console

If AI Studio doesn't work, try:

1. Go to: https://console.cloud.google.com/
2. Create a new project
3. Enable "Generative Language API"
4. Go to "APIs & Services" → "Credentials"
5. Create "API Key"
6. Copy and use that key

---

## Common Issues:

### "API key not valid"
- Key wasn't copied completely
- Key has extra spaces
- Need to enable Generative Language API

### "API key expired"
- Key is old, create a new one

### "API key leaked"
- Key was shared publicly, create a new one

---

## Current Status:
Your current key: `AIzaSyDXRa64c_PAtWYx0meQJrOM6G_fMALb5b4`
Status: ❌ Not valid

You need to create a NEW key following the steps above.
