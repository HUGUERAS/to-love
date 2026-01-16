-- Workspaces table to support multi-tenant auth
CREATE TYPE public.user_role AS ENUM ('ADMIN', 'OPERADOR');

CREATE TABLE public.workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    responsible_name TEXT NOT NULL,
    uf_default TEXT NOT NULL DEFAULT 'GO',
    link_expiration_days INTEGER NOT NULL DEFAULT 7 CHECK (link_expiration_days BETWEEN 1 AND 30),
    whatsapp_template TEXT NOT NULL DEFAULT '',
    created_by UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES public.workspaces (id) ON DELETE CASCADE,
    full_name TEXT,
    role public.user_role NOT NULL DEFAULT 'OPERADOR',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trigger to keep updated_at fresh
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workspaces_set_updated_at
BEFORE UPDATE ON public.workspaces
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Workspace policies
CREATE POLICY "Users can select own workspace"
ON public.workspaces
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.workspace_id = workspaces.id AND p.id = auth.uid()
  )
);

CREATE POLICY "Admins can update workspace"
ON public.workspaces
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.workspace_id = workspaces.id AND p.id = auth.uid() AND p.role = 'ADMIN'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.workspace_id = workspaces.id AND p.id = auth.uid() AND p.role = 'ADMIN'
  )
);

CREATE POLICY "Owner can insert workspace"
ON public.workspaces
FOR INSERT
WITH CHECK (created_by = auth.uid());

-- Profile policies
CREATE POLICY "Workspace members can view profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p2
    WHERE p2.workspace_id = profiles.workspace_id AND p2.id = auth.uid()
  )
);

CREATE POLICY "Users manage own profile"
ON public.profiles
FOR ALL
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Helper function to create workspace + admin profile
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
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Auth uid required';
  END IF;

  INSERT INTO public.workspaces (name, responsible_name, uf_default, link_expiration_days, whatsapp_template, created_by)
  VALUES (
    workspace_name,
    responsible_name,
    COALESCE(NULLIF(uf_default, ''), 'GO'),
    LEAST(GREATEST(COALESCE(link_expiration, 7), 1), 30),
    COALESCE(whatsapp_template, ''),
    auth.uid()
  )
  RETURNING id INTO new_workspace_id;

  INSERT INTO public.profiles (id, workspace_id, full_name, role)
  VALUES (auth.uid(), new_workspace_id, responsible_name, 'ADMIN')
  ON CONFLICT (id) DO UPDATE
    SET workspace_id = EXCLUDED.workspace_id,
        full_name = EXCLUDED.full_name,
        role = 'ADMIN',
        updated_at = now();

  RETURN new_workspace_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_workspace_admin TO authenticated;
