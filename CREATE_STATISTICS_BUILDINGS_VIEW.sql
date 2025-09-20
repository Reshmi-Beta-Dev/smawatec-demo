-- Create view for Statistics page Building grid
-- This view provides building data with associated devices and statistics

-- Drop existing view if it exists
DROP VIEW IF EXISTS statistics_buildings CASCADE;

-- Create the buildings statistics view
CREATE OR REPLACE VIEW statistics_buildings AS
SELECT 
    -- Row number for pagination
    ROW_NUMBER() OVER (ORDER BY b.name) as row_number,
    
    -- Building information
    b.id as building_id,
    b.name as building_name,
    b.address as building_address,
    b.created_at as building_created_at,
    
    -- Additional building details
    COALESCE(b.address, 'N/A') as zip_code, -- Using address as zip_code since zip_code column doesn't exist
    COALESCE(b.address, 'N/A') as address,
    
    -- Device information (first device for apartment/tenant display)
    COALESCE(first_device.name, 'N/A') as apartment,
    COALESCE(first_device.serial_number, 'N/A') as tenant,
    
    -- Simple device count
    COALESCE(device_count.count, 0) as device_count,
    COALESCE(device_count.active_count, 0) as active_devices,
    COALESCE(device_count.maintenance_count, 0) as maintenance_devices,
    COALESCE(device_count.inactive_count, 0) as inactive_devices

FROM buildings b
LEFT JOIN (
    SELECT 
        building_id,
        name,
        serial_number,
        ROW_NUMBER() OVER (PARTITION BY building_id ORDER BY created_at) as rn
    FROM devices
) first_device ON b.id = first_device.building_id AND first_device.rn = 1
LEFT JOIN (
    SELECT 
        building_id,
        COUNT(*) as count,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count,
        COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_count,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_count
    FROM devices 
    GROUP BY building_id
) device_count ON b.id = device_count.building_id
ORDER BY b.name;

-- Grant permissions
GRANT SELECT ON statistics_buildings TO authenticated;
GRANT SELECT ON statistics_buildings TO anon;

-- Create a function to get paginated buildings data
CREATE OR REPLACE FUNCTION get_statistics_buildings(
    page_number INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 8,
    sort_by TEXT DEFAULT 'building_name',
    sort_direction TEXT DEFAULT 'ASC'
)
RETURNS TABLE (
    buildings jsonb,
    total_count INTEGER,
    total_pages INTEGER,
    current_page INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    offset_value INTEGER;
    total_buildings INTEGER;
    total_pages_count INTEGER;
    buildings_data jsonb;
BEGIN
    -- Calculate offset
    offset_value := (page_number - 1) * page_size;
    
    -- Get total count
    SELECT COUNT(*) INTO total_buildings FROM statistics_buildings;
    
    -- Calculate total pages
    total_pages_count := CEIL(total_buildings::numeric / page_size::numeric)::INTEGER;
    
    -- Get paginated data with proper sorting
    IF sort_by = 'building_name' AND sort_direction = 'ASC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', row_number,
                'building', building_name,
                'zipCode', zip_code,
                'address', address,
                'apartment', apartment,
                'tenant', tenant,
                'device_count', device_count,
                'active_devices', active_devices,
                'maintenance_devices', maintenance_devices,
                'inactive_devices', inactive_devices
            )
        ) INTO buildings_data
        FROM (
            SELECT * FROM statistics_buildings ORDER BY building_name ASC LIMIT page_size OFFSET offset_value
        ) paginated_buildings;
    ELSIF sort_by = 'building_name' AND sort_direction = 'DESC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', row_number,
                'building', building_name,
                'zipCode', zip_code,
                'address', address,
                'apartment', apartment,
                'tenant', tenant,
                'device_count', device_count,
                'active_devices', active_devices,
                'maintenance_devices', maintenance_devices,
                'inactive_devices', inactive_devices
            )
        ) INTO buildings_data
        FROM (
            SELECT * FROM statistics_buildings ORDER BY building_name DESC LIMIT page_size OFFSET offset_value
        ) paginated_buildings;
    ELSIF sort_by = 'address' AND sort_direction = 'ASC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', row_number,
                'building', building_name,
                'zipCode', zip_code,
                'address', address,
                'apartment', apartment,
                'tenant', tenant,
                'device_count', device_count,
                'active_devices', active_devices,
                'maintenance_devices', maintenance_devices,
                'inactive_devices', inactive_devices
            )
        ) INTO buildings_data
        FROM (
            SELECT * FROM statistics_buildings ORDER BY address ASC LIMIT page_size OFFSET offset_value
        ) paginated_buildings;
    ELSIF sort_by = 'address' AND sort_direction = 'DESC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', row_number,
                'building', building_name,
                'zipCode', zip_code,
                'address', address,
                'apartment', apartment,
                'tenant', tenant,
                'device_count', device_count,
                'active_devices', active_devices,
                'maintenance_devices', maintenance_devices,
                'inactive_devices', inactive_devices
            )
        ) INTO buildings_data
        FROM (
            SELECT * FROM statistics_buildings ORDER BY address DESC LIMIT page_size OFFSET offset_value
        ) paginated_buildings;
    ELSE
        -- Default sorting by building_name ASC
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', row_number,
                'building', building_name,
                'zipCode', zip_code,
                'address', address,
                'apartment', apartment,
                'tenant', tenant,
                'device_count', device_count,
                'active_devices', active_devices,
                'maintenance_devices', maintenance_devices,
                'inactive_devices', inactive_devices
            )
        ) INTO buildings_data
        FROM (
            SELECT * FROM statistics_buildings ORDER BY building_name ASC LIMIT page_size OFFSET offset_value
        ) paginated_buildings;
    END IF;
    
    -- Return the result
    RETURN QUERY SELECT 
        COALESCE(buildings_data, '[]'::jsonb) as buildings,
        total_buildings as total_count,
        total_pages_count as total_pages,
        page_number as current_page;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_statistics_buildings(INTEGER, INTEGER, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_statistics_buildings(INTEGER, INTEGER, TEXT, TEXT) TO authenticated;

-- Test the view
SELECT 'Statistics Buildings view created successfully. Testing...' as status;
SELECT COUNT(*) as total_records FROM statistics_buildings;
SELECT * FROM statistics_buildings LIMIT 5;
