DROP POLICY IF EXISTS "Tweets: admins delete" ON public.tweets;
DROP POLICY IF EXISTS "Tweets: admins update" ON public.tweets;
DROP POLICY IF EXISTS "Tweets: admins write" ON public.tweets;
DROP POLICY IF EXISTS "Roles: admins manage" ON public.user_roles;

CREATE POLICY "Tweets: admins delete"
ON public.tweets
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'::public.app_role
  )
);

CREATE POLICY "Tweets: admins update"
ON public.tweets
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'::public.app_role
  )
);

CREATE POLICY "Tweets: admins write"
ON public.tweets
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role = 'admin'::public.app_role
  )
);

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM authenticated, anon;