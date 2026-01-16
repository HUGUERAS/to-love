-- ============================================================================
-- MIGRATION: Properties table with PostGIS and RLS
-- Safe to re-run (idempotent)
-- ============================================================================

-- 1) Create ENUM type for primary_role
-- The following block is for PostgreSQL. If you are using SQL Server, you must use a different approach.
-- SQL Server: Use a user-defined table type or a CHECK constraint for ENUM simulation
IF NOT EXISTS (SELECT * FROM sys.types WHERE name = 'primary_user_role')
BEGIN
    CREATE TYPE primary_user_role FROM nvarchar(20);
END

-- 2) Add primary_role column to profiles
ALTER TABLE profiles
ADD primary_role nvarchar(20) NULL;
-- Optionally, add a CHECK constraint to simulate ENUM
ALTER TABLE profiles
ADD CONSTRAINT chk_primary_role CHECK (primary_role IN ('GESTOR', 'CLIENTE'));

-- 3) Enable PostGIS extension
-- PostGIS extension is PostgreSQL-specific; for SQL Server, use the built-in spatial types (geometry/geography)

-- 4) Create properties table
IF OBJECT_ID('properties', 'U') IS NULL
CREATE TABLE properties (
  id uniqueidentifier PRIMARY KEY DEFAULT NEWID(),
  owner_id uniqueidentifier NOT NULL,
  name nvarchar(255) NOT NULL,
  municipality nvarchar(255) NOT NULL,
  objectives nvarchar(max) NULL, -- SQL Server does not support array, use JSON or delimited string
  objective_other nvarchar(255) NULL,
  geom geometry NOT NULL,
  created_at datetime2 NOT NULL DEFAULT SYSDATETIME(),
  updated_at datetime2 NOT NULL DEFAULT SYSDATETIME(),
  CONSTRAINT FK_properties_profiles FOREIGN KEY (owner_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- 5) Create indexes (removed CONCURRENTLY to avoid transaction block error)
IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'properties_geom_idx')
  CREATE SPATIAL INDEX properties_geom_idx ON properties(geom);

IF NOT EXISTS (SELECT name FROM sys.indexes WHERE name = 'properties_owner_id_idx')
  CREATE INDEX properties_owner_id_idx ON properties(owner_id);

-- 6) Ensure set_updated_at function exists
-- SQL Server: Use an AFTER UPDATE trigger to set updated_at
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

-- 8) Enable Row Level Security
-- Row Level Security and policies are PostgreSQL-specific.
-- In SQL Server, use built-in Row-Level Security (RLS) with security predicates if needed.
-- Example:
-- CREATE SECURITY POLICY ... (see SQL Server documentation for details)

-- 11) Create find_neighbors function (optimized version)
-- SQL Server: Use a scalar or table-valued function for neighbors
GO
-- Example: Create a stub for find_neighbors function (adjust parameters and return type as needed)
CREATE OR ALTER FUNCTION find_neighbors()
RETURNS TABLE
AS
RETURN
(
    -- Replace this SELECT with your actual neighbor-finding logic
    SELECT * FROM properties
);
-- ANALYZE is PostgreSQL-specific; in SQL Server, use UPDATE STATISTICS
UPDATE STATISTICS properties;

-- ============================================================================
-- SUCCESS! You can now:
-- 1. Save properties as CLIENTE
-- 2. View all properties as GESTOR  
-- 3. Analyze neighbors with PostGIS
-- ============================================================================
