-- Fix RLS Policies for Buildings Table
-- This script will enable proper access for the buildings table

-- First, let's check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'buildings';

-- Enable RLS on buildings table (if not already enabled)
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

-- Create policies for buildings table

-- 1. Allow anonymous users to read all buildings
CREATE POLICY "Allow anonymous read access to buildings" ON buildings
    FOR SELECT
    TO anon
    USING (true);

-- 2. Allow anonymous users to insert new buildings
CREATE POLICY "Allow anonymous insert access to buildings" ON buildings
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- 3. Allow anonymous users to update buildings
CREATE POLICY "Allow anonymous update access to buildings" ON buildings
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- 4. Allow anonymous users to delete buildings
CREATE POLICY "Allow anonymous delete access to buildings" ON buildings
    FOR DELETE
    TO anon
    USING (true);

-- Also create similar policies for building_groups table (if needed)
ALTER TABLE building_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access to building_groups" ON building_groups
    FOR SELECT
    TO anon
    USING (true);

CREATE POLICY "Allow anonymous insert access to building_groups" ON building_groups
    FOR INSERT
    TO anon
    WITH CHECK (true);

CREATE POLICY "Allow anonymous update access to building_groups" ON building_groups
    FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anonymous delete access to building_groups" ON building_groups
    FOR DELETE
    TO anon
    USING (true);

-- Create policies for cities table (if needed)
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access to cities" ON cities
    FOR SELECT
    TO anon
    USING (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('buildings', 'building_groups', 'cities')
ORDER BY tablename, policyname;
