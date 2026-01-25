-- Drop and recreate view with security_invoker=on
DROP VIEW IF EXISTS public.resources_public;

CREATE VIEW public.resources_public
WITH (security_invoker=on) AS
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