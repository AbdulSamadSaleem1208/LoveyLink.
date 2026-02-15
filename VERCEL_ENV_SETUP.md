# Environment Variable Configuration for Password Reset

## Important: Vercel Environment Variables

The password reset emails were sending users to `localhost:3000` instead of the production domain. This has been fixed locally, but **you must also update the environment variable in Vercel**.

### Steps to Fix in Vercel:

1. Go to your Vercel project dashboard: https://vercel.com/
2. Navigate to your project (LoveyLink)
3. Go to **Settings** → **Environment Variables**
4. Find or add `NEXT_PUBLIC_SITE_URL`
5. Set the value to: `https://loveylink.net`
6. Make sure it's set for **Production**, **Preview**, and **Development** environments
7. **Redeploy** your application for changes to take effect

### Current Configuration

**Local (.env.local):**
```
NEXT_PUBLIC_SITE_URL=https://loveylink.net
```

**Vercel (Must be set manually):**
```
NEXT_PUBLIC_SITE_URL=https://loveylink.net
```

### Why This Matters

The `getSiteUrl()` function in `src/app/auth/actions.ts` uses this environment variable to construct the password reset redirect URL:

```typescript
const getSiteUrl = async () => {
    let url = process.env.NEXT_PUBLIC_SITE_URL; // Uses this first
    
    if (!url) {
        // Falls back to Vercel URLs or localhost
    }
    
    return url.replace(/\/$/, "");
};
```

When a user requests a password reset:
1. Email is sent with link: `https://loveylink.net/auth/callback?code=...&next=/update-password`
2. User clicks link
3. Callback exchanges code for session
4. User is redirected to `/update-password`

Without the correct `NEXT_PUBLIC_SITE_URL`, the email would contain `http://localhost:3000` instead of your production domain.

---

## Testing

After updating Vercel environment variables:

1. Request a password reset from production site
2. Check email - link should be: `https://loveylink.net/auth/callback?code=...`
3. Click link - should redirect to: `https://loveylink.net/update-password`
4. Should NOT redirect to localhost

---

## Files Modified

- `.env.local` - Updated `NEXT_PUBLIC_SITE_URL` to `https://loveylink.net`

**Note:** `.env.local` is in `.gitignore` and won't be pushed to GitHub. You must set the environment variable in Vercel manually.
