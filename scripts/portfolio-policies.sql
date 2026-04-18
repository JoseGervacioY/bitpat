-- PORTFOLIO ASSETS & TRANSACTIONS SECURITY POLICIES
-- Run this in the Supabase SQL Editor

-- =============================================
-- 1. Correct Table: portfolio_assets
-- =============================================

-- Ensure RLS is enabled
ALTER TABLE public.portfolio_assets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own assets
DROP POLICY IF EXISTS "Users can view own assets" ON public.portfolio_assets;
CREATE POLICY "Users can view own assets" ON public.portfolio_assets
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own assets
DROP POLICY IF EXISTS "Users can insert own assets" ON public.portfolio_assets;
CREATE POLICY "Users can insert own assets" ON public.portfolio_assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own assets
DROP POLICY IF EXISTS "Users can update own assets" ON public.portfolio_assets;
CREATE POLICY "Users can update own assets" ON public.portfolio_assets
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own assets
DROP POLICY IF EXISTS "Users can delete own assets" ON public.portfolio_assets;
CREATE POLICY "Users can delete own assets" ON public.portfolio_assets
  FOR DELETE USING (auth.uid() = user_id);


-- =============================================
-- 2. Table: transactions
-- =============================================

-- Ensure RLS is enabled
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own transactions
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- NOTE: No Update/Delete policies for transactions as they are typically immutable logs.
