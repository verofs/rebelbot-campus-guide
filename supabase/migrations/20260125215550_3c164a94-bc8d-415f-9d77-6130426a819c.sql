-- Create a public view for resources that excludes sensitive contact info
CREATE OR REPLACE VIEW public.resources_public AS
SELECT
  id,
  created_at,
  updated_at,
  title,
  description,
  category,
  location,
  hours,
  url,
  tags,
  image_url
FROM public.resources;

-- Grant access to the view
GRANT SELECT ON public.resources_public TO anon, authenticated;

-- Update RLS policy to restrict base table SELECT to admins only
DROP POLICY IF EXISTS "Anyone can view resources" ON public.resources;

CREATE POLICY "Admins can view all resources"
ON public.resources
FOR SELECT
USING (is_admin());