# Password Reset Redirect Fix - Complete Guide

## ✅ Code Changes (Already Done)

All code changes have been completed and pushed to GitHub:

1. **`src/app/auth/actions.ts`** - Changed localhost fallback to `https://loveylink.net`
2. **`.env.local`** - Set `NEXT_PUBLIC_SITE_URL=https://loveylink.net`
3. **`src/app/dashboard/success/[id]/page.tsx`** - Fixed QR code URLs

---

## ⚠️ REQUIRED: Manual Configuration Steps

You MUST complete these 3 steps for the fix to work in production:

### Step 1: Configure Supabase Site URL

1. Go to: **https://supabase.com/dashboard**
2. Select your project: **mjgfdhdvxghylazwszzg**
3. Click **Authentication** (left sidebar)
4. Click **URL Configuration**
5. Update **Site URL** to: `https://loveylink.net`
6. Click **Save**

**Also add these Redirect URLs:**
- `https://loveylink.net/**`
- `https://loveylink.net/auth/callback**`

Click **Save** again.

---

### Step 2: Configure Vercel Environment Variables

1. Go to: **https://vercel.com/dashboard**
2. Select your project (LoveyLink)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Set:
   - **Name**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://loveylink.net`
   - **Environments**: Check all (Production, Preview, Development)
6. Click **Save**

**Then Redeploy:**
1. Go to **Deployments** tab
2. Click **...** on the latest deployment
3. Click **Redeploy**

---

### Step 3: Test with NEW Password Reset

> **CRITICAL:** Old emails sent before the fix will ALWAYS redirect to localhost. You MUST request a NEW password reset.

1. **Delete/ignore** any old password reset emails
2. Go to: **https://loveylink.net/forgot-password**
3. Enter your email
4. Click "Send Reset Link"
5. **Wait for the NEW email** (1-2 minutes)
6. Open the NEW email
7. **Check the link** - it should start with: `https://loveylink.net/auth/callback`
8. Click the link
9. You should be redirected to: `https://loveylink.net/update-password`

---

## Why This Was Happening

### Root Cause 1: Hardcoded Localhost
```typescript
// BEFORE (in src/app/auth/actions.ts)
url = "http://localhost:3000"; // ❌

// AFTER
url = "https://loveylink.net"; // ✅
```

### Root Cause 2: Supabase Configuration
Supabase uses its own Site URL setting to generate email links. If this is set to localhost, emails will always use localhost regardless of code changes.

### Root Cause 3: Environment Variables
Vercel deployments need `NEXT_PUBLIC_SITE_URL` set to use the production domain.

---

## Expected Behavior

### Before Fix
```
Email Link: http://localhost:3000/?code=xxx
Click → Redirects to localhost → Error (page doesn't exist)
```

### After Fix
```
Email Link: https://loveylink.net/auth/callback?code=xxx&next=/update-password
Click → Redirects to production → Shows reset password form ✅
```

---

## Verification Checklist

- [ ] Supabase Site URL set to `https://loveylink.net`
- [ ] Supabase Redirect URLs added
- [ ] Vercel environment variable `NEXT_PUBLIC_SITE_URL` added
- [ ] Vercel application redeployed
- [ ] Old password reset emails deleted/ignored
- [ ] NEW password reset requested from production site
- [ ] NEW email link starts with `https://loveylink.net`
- [ ] Clicking NEW link shows reset password form

---

## Summary

✅ **Code Fixed** - All localhost references replaced with `https://loveylink.net`
✅ **Pushed to GitHub** - Changes are in your repository
⚠️ **Manual Steps Required** - You must configure Supabase and Vercel
⚠️ **Test with NEW Email** - Old emails will never work

**After completing the 3 manual steps above, password reset will work correctly!**
