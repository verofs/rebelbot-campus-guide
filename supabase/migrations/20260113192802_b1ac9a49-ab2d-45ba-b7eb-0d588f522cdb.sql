-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view clubs" ON public.clubs;

-- Create new policy requiring authentication to view clubs
CREATE POLICY "Authenticated users can view clubs"
ON public.clubs
FOR SELECT
TO authenticated
USING (true);