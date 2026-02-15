# CRITICAL: How to Fix Password Reset Emails

## The Problem

You're clicking on an **OLD email** that was sent BEFORE we fixed the code. Old emails cannot be changed - they permanently contain the old localhost URL.

## The Solution

You MUST do these 3 things:

---

## Step 1: Update Supabase Site URL (REQUIRED)

> [!IMPORTANT]
> **This is the most critical step!** Without this, new emails will still use localhost.

1. Go to: https://supabase.com/dashboard
2. Select your project: `mjgfdhdvxghylazwszzg`
3. Click **Authentication** (left sidebar)
4. Click **URL Configuration**
5. Find **Site URL** field
6. Change from: `http://localhost:3000`
7. Change to: `https://loveylink.net`
8. Click **Save**

### Also Add Redirect URLs

In the same page, under **Redirect URLs**, add:
```
https://loveylink.net/**
https://loveylink.net/auth/callback**
```

Click **Save** again.

---

## Step 2: Update Vercel Environment Variables (REQUIRED)

1. Go to: https://vercel.com/dashboard
2. Select your project (LoveyLink)
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Name**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://loveylink.net`
   - **Environments**: Check all (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your application:
   - Go to **Deployments**
   - Click **...** on latest deployment
   - Click **Redeploy**

---

## Step 3: Request NEW Password Reset (REQUIRED)

> [!WARNING]
> **DO NOT use the old email!** It will ALWAYS go to localhost because it was sent before the fix.

1. **Delete or ignore** the old password reset email
2. Go to: https://loveylink.net/forgot-password
3. Enter your email address
4. Click "Send Reset Link"
5. **Wait for the NEW email** (may take 1-2 minutes)
6. Open the NEW email
7. Check the link - it should start with: `https://loveylink.net/auth/callback`
8. Click the link in the NEW email
9. You should be redirected to: `https://loveylink.net/update-password`

---

## Why This Happens

### Old Email (Before Fix)
```
Generated: February 16, 2:50 AM (before code fix)
Link: http://localhost:3000/?code=xxx
Result: ❌ Always redirects to localhost (cannot be changed)
```

### New Email (After Fix)
```
Generated: February 16, 3:05 AM (after code fix + Supabase config)
Link: https://loveylink.net/auth/callback?code=xxx&next=/update-password
Result: ✅ Redirects to production correctly
```

---

## Checklist

Before requesting a new password reset, make sure:

- [ ] Supabase Site URL updated to `https://loveylink.net`
- [ ] Supabase Redirect URLs added
- [ ] Vercel environment variable `NEXT_PUBLIC_SITE_URL` set
- [ ] Vercel application redeployed
- [ ] Deleted/ignored old password reset email
- [ ] Requested NEW password reset from production site
- [ ] Checked NEW email link starts with `https://loveylink.net`

---

## If New Email Still Has Localhost

If you complete all steps above and the NEW email still has localhost:

1. Check Vercel deployment logs for errors
2. Verify Supabase Site URL was saved correctly
3. Wait 5 minutes for caches to clear
4. Try requesting password reset again
5. Check browser console for errors

---

## Summary

✅ Code is fixed
✅ Changes pushed to GitHub
⚠️ **You MUST update Supabase Site URL**
⚠️ **You MUST update Vercel environment variables**
⚠️ **You MUST request a NEW password reset**

**Old emails will NEVER work** - they were generated before the fix!
