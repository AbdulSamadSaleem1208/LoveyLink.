-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS TABLE (Extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  subscription_status TEXT DEFAULT 'free', -- 'free' | 'active' | 'past_due' | 'canceled'
  stripe_customer_id TEXT,
  subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LOVE PAGES TABLE
CREATE TABLE public.love_pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT 'My Love Page',
  recipient_name TEXT,
  sender_name TEXT,
  message TEXT,
  theme_config JSONB DEFAULT '{}'::JSONB, -- Colors, fonts, background
  images TEXT[] DEFAULT '{}',
  music_url TEXT,
  passcode TEXT, -- Optional password protection
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAGE VIEWS TABLE (Analytics)
CREATE TABLE public.page_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page_id UUID REFERENCES public.love_pages(id) ON DELETE CASCADE NOT NULL,
  viewer_ip TEXT, 
  user_agent TEXT,
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR CODES TABLE
CREATE TABLE public.qr_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page_id UUID REFERENCES public.love_pages(id) ON DELETE CASCADE NOT NULL,
  qr_data TEXT NOT NULL, -- The URL or content encoded
  style_config JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR SCANS TABLE (Analytics)
CREATE TABLE public.qr_scans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  qr_id UUID REFERENCES public.qr_codes(id) ON DELETE CASCADE NOT NULL,
  scanner_ip TEXT,
  scanner_device TEXT,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- ADMIN ROLES TABLE
CREATE TABLE public.admin_roles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'moderator', -- 'admin' | 'moderator'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSCRIPTIONS TABLE (Synced with Stripe)
CREATE TABLE public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL,
  plan_id TEXT,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS TABLE
CREATE TABLE public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  stripe_payment_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'pkr',
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.love_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
-- Trigger to create user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- LOVE PAGES POLICIES
CREATE POLICY "Public can view published pages" ON public.love_pages FOR SELECT USING (published = TRUE);
CREATE POLICY "Users can view own pages" ON public.love_pages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own pages" ON public.love_pages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pages" ON public.love_pages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pages" ON public.love_pages FOR DELETE USING (auth.uid() = user_id);

-- PAGE VIEWS POLICIES
CREATE POLICY "Public insert page views" ON public.page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own page stats" ON public.page_views FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.love_pages WHERE id = page_views.page_id AND user_id = auth.uid())
);

-- QR CODES POLICIES
CREATE POLICY "Users can view own QR codes" ON public.qr_codes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.love_pages WHERE id = qr_codes.page_id AND user_id = auth.uid())
);
-- QR Codes are generated server-side, so plain users might not need INSERT specific if done via service role,
-- but if done via RLS-authenticated call:
CREATE POLICY "Users can insert own QR codes" ON public.qr_codes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.love_pages WHERE id = qr_codes.page_id AND user_id = auth.uid())
);

-- QR SCANS POLICIES
CREATE POLICY "Public insert qr scans" ON public.qr_scans FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view own qr scans" ON public.qr_scans FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.qr_codes q JOIN public.love_pages p ON q.page_id = p.id WHERE q.id = qr_scans.qr_id AND p.user_id = auth.uid())
);

-- ADMIN POLICIES (Simplified for now - strictly checks admin_roles)
CREATE POLICY "Admins can view everything" ON public.users FOR SELECT USING (EXISTS (SELECT 1 FROM public.admin_roles WHERE user_id = auth.uid()));
-- (Repeat similar admin 'OR' logic for other tables if strictly needed, or just rely on service role for admin dashboard)

-- STORAGE BUCKETS (If supported by SQL execution environment, else via Dashboard)
-- Insert into storage.buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('gifs', 'gifs', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('music', 'music', true) ON CONFLICT DO NOTHING;

-- STORAGE POLICIES
CREATE POLICY "Public Access Images" ON storage.objects FOR SELECT USING (bucket_id = 'images');
CREATE POLICY "Auth Upload Images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');
CREATE POLICY "Owner Delete Images" ON storage.objects FOR DELETE USING (bucket_id = 'images' AND auth.uid() = owner);

CREATE POLICY "Public Access GIFs" ON storage.objects FOR SELECT USING (bucket_id = 'gifs');
CREATE POLICY "Auth Upload GIFs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gifs' AND auth.role() = 'authenticated');

CREATE POLICY "Public Access Music" ON storage.objects FOR SELECT USING (bucket_id = 'music');
CREATE POLICY "Auth Upload Music" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'music' AND auth.role() = 'authenticated');

-- Payment Requests (for Manual Easypaisa)
CREATE TABLE public.payment_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'PKR',
  trx_id TEXT NOT NULL, 
  status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  payment_method TEXT NOT NULL DEFAULT 'easypaisa_manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for payment_requests
ALTER TABLE public.payment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payment requests" ON public.payment_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payment requests" ON public.payment_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
