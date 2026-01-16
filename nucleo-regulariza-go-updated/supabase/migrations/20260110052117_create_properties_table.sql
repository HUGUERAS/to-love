-- Enable PostGIS extension for geographic data support
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create properties table to store client land data
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    municipality TEXT NOT NULL,
    objectives TEXT[] NOT NULL DEFAULT '{}',
    objective_other TEXT,
    geom geometry(Polygon, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create spatial index for efficient geographic queries
CREATE INDEX IF NOT EXISTS properties_geom_idx ON public.properties USING GIST (geom);

-- Create index on owner_id for faster lookups
CREATE INDEX IF NOT EXISTS properties_owner_id_idx ON public.properties (owner_id);

-- Trigger to keep updated_at fresh
CREATE TRIGGER properties_set_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Policy: Clients can manage their own properties
CREATE POLICY "Clients can manage own properties"
ON public.properties
FOR ALL
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

-- Policy: Gestores can view all properties (for the opportunities map)
CREATE POLICY "Gestores can view all properties"
ON public.properties
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.primary_role = 'GESTOR'
  )
);
