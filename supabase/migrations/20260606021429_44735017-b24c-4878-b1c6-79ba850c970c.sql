REVOKE EXECUTE ON FUNCTION public.add_user_role(public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_user_role(public.app_role) TO authenticated;