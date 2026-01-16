-- MIGRATION SCRIPT FOR SQL SERVER ONLY

-- 1. Add primary_role column to profiles (with CHECK constraint)
IF COL_LENGTH('profiles', 'primary_role') IS NULL
BEGIN
    ALTER TABLE profiles ADD primary_role nvarchar(20) NULL;
    ALTER TABLE profiles ADD CONSTRAINT chk_primary_role CHECK (primary_role IN ('GESTOR', 'CLIENTE'));
END

-- 2. Create properties table
IF OBJECT_ID('properties', 'U') IS NULL
BEGIN
    CREATE TABLE properties (
        id uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
        owner_id uniqueidentifier NOT NULL,
        name nvarchar(255) NOT NULL,
        municipality nvarchar(255) NOT NULL,
        objectives nvarchar(max) NULL,
        objective_other nvarchar(255) NULL,
        geom geometry NOT NULL,
        created_at datetime2 NOT NULL DEFAULT SYSDATETIME(),
        updated_at datetime2 NOT NULL DEFAULT SYSDATETIME(),
        CONSTRAINT FK_properties_profiles FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE
    );
END

-- 3. Create indexes
IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'properties_geom_idx')
    CREATE SPATIAL INDEX properties_geom_idx ON properties(geom);
IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'properties_owner_id_idx')
    CREATE INDEX properties_owner_id_idx ON properties(owner_id);

-- 4. Trigger to update updated_at
IF OBJECT_ID('trg_properties_set_updated_at', 'TR') IS NOT NULL
    DROP TRIGGER trg_properties_set_updated_at;
GO
CREATE TRIGGER trg_properties_set_updated_at
ON properties
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE properties
    SET updated_at = SYSDATETIME()
    FROM inserted
    WHERE properties.id = inserted.id;
END
GO

-- 5. Function to find neighbors
GO
CREATE OR ALTER FUNCTION find_neighbors (
    @property_id uniqueidentifier,
    @distance_meters float = 0
)
RETURNS TABLE
AS
RETURN
    WITH ref AS (
        SELECT geom FROM properties WHERE id = @property_id
    )
    SELECT
        p.id AS neighbor_id,
        p.name AS neighbor_name,
        p.owner_id AS neighbor_owner_id,
        ref.geom.STDistance(p.geom) AS distance_m,
        (CASE WHEN ref.geom.STIntersects(p.geom) = 1 THEN CAST(1 AS bit) ELSE CAST(0 AS bit) END) AS touches
    FROM properties p
    CROSS JOIN ref
    WHERE p.id <> @property_id
      AND (
        ref.geom.STIntersects(p.geom) = 1
        OR (@distance_meters > 0 AND ref.geom.STDistance(p.geom) <= @distance_meters)
      )
    ORDER BY ref.geom.STDistance(p.geom);
GO

-- 6. Update statistics
UPDATE STATISTICS properties;
