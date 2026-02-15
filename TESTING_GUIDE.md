# Quick Start: Testing Subscription Fixes

## 🚀 First: Run Database Migration

**CRITICAL:** You must run the SQL migration before testing!

1. Open: https://supabase.com/dashboard
2. Select your LoveyLink project
3. Click "SQL Editor" → "New Query"
4. Copy/paste contents of: `supabase/migrations/20260216_subscription_management.sql`
5. Click "Run"
6. Verify no errors appear

---

## ✅ Test 1: Admin Revoke Button

1. Go to: `http://localhost:3000/admin/users`
2. Find a user with "active" status
3. Click "Revoke" button
4. Confirm the action
5. **Expected:** Success toast, status changes to "free"
6. **Important:** Log in as that user and check dashboard
7. **Expected:** Should show "Upgrade to Premium" (not "Premium Active")

> **Note:** The revoke now also marks payment_requests as 'revoked' to prevent fallback logic from granting premium access.

---

## ✅ Test 2: Auto-Expiration

### Option A: Test with Real User
1. In Supabase, update a user's subscription:
   ```sql
   UPDATE subscriptions 
   SET current_period_end = NOW() - INTERVAL '1 day'
   WHERE user_id = 'PASTE_USER_ID_HERE';
   ```
2. Log in as that user
3. Go to `/dashboard`
4. **Expected:** No premium badge, shows "Upgrade to Premium"

### Option B: Test Function Directly
Run in Supabase SQL Editor:
```sql
SELECT * FROM expire_old_subscriptions();
```

---

## 📋 What Was Fixed

✅ Admin revoke button now works (was showing "Failed to update subscription")
✅ Subscriptions automatically expire after 30 days
✅ Better error messages and logging
✅ Handles edge cases (missing subscription records)

---

## 📁 Files Changed

**Created:**
- `supabase/migrations/20260216_subscription_management.sql`
- `src/lib/subscription-utils.ts`
- `supabase/MIGRATION_INSTRUCTIONS.md`

**Modified:**
- `src/app/admin/users/actions.ts`
- `src/app/dashboard/page.tsx`

---

## 🔍 Need More Details?

See [walkthrough.md](file:///C:/Users/Panda/.gemini/antigravity/brain/478e1cc2-12ca-4400-9100-563ca4ccfe6f/walkthrough.md) for complete documentation.
