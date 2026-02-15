# Database Migration Instructions

## Running the Subscription Management Migration

You need to run the SQL migration file in your Supabase dashboard to enable the subscription revoke fix and automatic expiration features.

### Steps:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your LoveyLink project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Run the Migration**
   - Open the file: `supabase/migrations/20260216_subscription_management.sql`
   - Copy the entire contents
   - Paste into the SQL Editor
   - Click "Run" button

4. **Verify Success**
   - You should see "Success. No rows returned" or similar
   - Check that no errors appear

5. **Test the Functions**
   Run these verification queries in the SQL Editor:

   ```sql
   -- Check if policies are created
   SELECT policyname, tablename FROM pg_policies WHERE tablename = 'subscriptions';
   
   -- Test the expiration function
   SELECT * FROM public.expire_old_subscriptions();
   ```

### What This Migration Does:

✅ Adds RLS policies so admins can update subscriptions
✅ Creates `expire_old_subscriptions()` function for bulk expiration
✅ Creates `expire_user_subscription(user_id)` function for individual expiration
✅ Adds performance indexes
✅ Grants proper permissions

### After Running:

The admin panel revoke button should work correctly, and subscriptions will automatically expire after 30 days when users visit their dashboard.

---

## Optional: Set Up Automatic Cron Job

If you want subscriptions to expire automatically without waiting for user dashboard visits, you can set up a cron job:

1. Enable `pg_cron` extension in Supabase (if available)
2. Run this SQL:

```sql
-- Run expiration check every day at midnight
SELECT cron.schedule(
  'expire-subscriptions',
  '0 0 * * *',
  'SELECT public.expire_old_subscriptions();'
);
```

**Note:** Check if your Supabase plan supports `pg_cron`. If not, the dashboard-based expiration will work fine.
