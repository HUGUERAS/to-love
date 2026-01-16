-- Create a new ENUM type for the primary user role
CREATE TYPE public.primary_user_role AS ENUM ('GESTOR', 'CLIENTE');

-- Add the new primary_role column to the profiles table
-- It's nullable for now to not break existing profiles.
-- We will handle setting this value in the application logic.
ALTER TABLE public.profiles
ADD COLUMN primary_role public.primary_user_role;

-- Update the create_workspace_admin function to correctly handle profile creation/updates.
-- The user calling this is by definition a GESTOR.
-- The function now ensures the profile exists with the correct role before associating the workspace.
CREATE OR REPLACE FUNCTION public.create_workspace_admin(
  workspace_name TEXT,
  responsible_name TEXT,
  uf_default TEXT DEFAULT 'GO',
  link_expiration INTEGER DEFAULT 7,
  whatsapp_template TEXT DEFAULT ''
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_workspace_id UUID;
  user_id UUID := auth.uid();
BEGIN
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Auth uid required';
  END IF;

  -- Ensure the user has a profile and is marked as a GESTOR
  INSERT INTO public.profiles (id, full_name, primary_role, role)
  VALUES (user_id, responsible_name, 'GESTOR', 'ADMIN')
  ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        primary_role = 'GESTOR', -- Ensure role is correctly set
        updated_at = now();

  -- Create the workspace
  INSERT INTO public.workspaces (name, responsible_name, uf_default, link_expiration_days, whatsapp_template, created_by)
  VALUES (
    workspace_name,
    responsible_name,
    COALESCE(NULLIF(uf_default, ''), 'GO'),
    LEAST(GREATEST(COALESCE(link_expiration, 7), 1), 30),
    COALESCE(whatsapp_template, ''),
    user_id
  )
  RETURNING id INTO new_workspace_id;

  -- Associate the workspace with the user's profile
  UPDATE public.profiles
  SET workspace_id = new_workspace_id
  WHERE id = user_id;

  RETURN new_workspace_id;
END;
$$;
