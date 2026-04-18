-- SUPABASE SETUP SCRIPT
-- Run this in the Supabase SQL Editor

-- 1. Ensure Profiles table exists and is linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text,
  email text,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 3. Profiles Policies
-- Allow users to insert their own profile during registration
CREATE POLICY "Allow individual insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to view their own profile
CREATE POLICY "Allow individual read" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Allow individual update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4. Transactions Policies
-- Allow users to view their own transactions
CREATE POLICY "Allow users to view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own transactions
CREATE POLICY "Allow users to insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- NOTE FOR PRODUCTION:
-- Go to Authentication > Settings in Supabase Dashboard and:
-- 1. Disable "Confirm Email" if you want users to log in immediately without verifying their email address.
-- 2. Add your Vercel URL to "Site URL" and "Redirect URLs".
