-- MIGRATION SCRIPT FOR POSTGRESQL ONLY

-- 1. Create ENUM type for primary_role
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'primary_user_role') THEN
        CREATE TYPE primary_user_role AS ENUM ('GESTOR', 'CLIENTE');
    END IF;
END$$;

-- 2. Add primary_role column to profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='primary_role') THEN
        ALTER TABLE profiles ADD COLUMN primary_role primary_user_role;
    END IF;
END$$;

-- 3. Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- 4. Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    municipality text NOT NULL,
    objectives text[],
    objective_other text,
    geom geometry NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS properties_geom_idx ON properties USING GIST (geom);
CREATE INDEX IF NOT EXISTS properties_owner_id_idx ON properties(owner_id);

-- 6. Trigger to update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_properties_set_updated_at ON properties;
CREATE TRIGGER trg_properties_set_updated_at
BEFORE UPDATE ON properties
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 7. Function to find neighbors
CREATE OR REPLACE FUNCTION find_neighbors(property_id uuid, distance_meters float DEFAULT 0)
RETURNS TABLE (
    neighbor_id uuid,
    neighbor_name text,
    neighbor_owner_id uuid,
    distance_m float,
    touches boolean
) AS $$
BEGIN
    RETURN QUERY
    WITH ref AS (
        SELECT geom FROM properties WHERE id = property_id
    )
    SELECT
        p.id,
        p.name,
        p.owner_id,
        ST_Distance(ref.geom, p.geom),
        ST_Intersects(ref.geom, p.geom)
    FROM properties p, ref
    WHERE p.id <> property_id
      AND (
        ST_Intersects(ref.geom, p.geom)
        OR (distance_meters > 0 AND ST_Distance(ref.geom, p.geom) <= distance_meters)
      )
    ORDER BY ST_Distance(ref.geom, p.geom);
END;
$$ LANGUAGE plpgsql;

-- 8. Analyze table
ANALYZE properties;
