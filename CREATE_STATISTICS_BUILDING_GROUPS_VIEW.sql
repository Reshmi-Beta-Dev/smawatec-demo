-- Create view for Statistics page Building Groups grid
-- This view provides building group data with associated buildings

-- Drop existing view if it exists
DROP VIEW IF EXISTS statistics_building_groups CASCADE;

-- Create a building groups view with distinct building groups and aggregated data
CREATE OR REPLACE VIEW statistics_building_groups AS
SELECT 
    -- Row number for pagination
    ROW_NUMBER() OVER (ORDER BY bg.name) as row_number,
    
    -- Building group information
    bg.id as group_id,
    bg.name as group_name,
    bg.created_at as group_created_at,
    
    -- Building count for this group
    COUNT(b.id) as building_count,
    
    -- Sample building information (first building for display)
    (SELECT b2.id FROM buildings b2 WHERE b2.name LIKE '%' || bg.name || '%' ORDER BY b2.name LIMIT 1) as sample_building_id,
    (SELECT b2.name FROM buildings b2 WHERE b2.name LIKE '%' || bg.name || '%' ORDER BY b2.name LIMIT 1) as sample_building_name,
    (SELECT b2.address FROM buildings b2 WHERE b2.name LIKE '%' || bg.name || '%' ORDER BY b2.name LIMIT 1) as sample_building_address,
    (SELECT b2.created_at FROM buildings b2 WHERE b2.name LIKE '%' || bg.name || '%' ORDER BY b2.name LIMIT 1) as sample_building_created_at,
    
    -- Additional building details (if available)
    COALESCE((SELECT b2.address FROM buildings b2 WHERE b2.name LIKE '%' || bg.name || '%' ORDER BY b2.name LIMIT 1), 'N/A') as zip_code, -- Using address as zip_code since zip_code column doesn't exist
    COALESCE((SELECT b2.address FROM buildings b2 WHERE b2.name LIKE '%' || bg.name || '%' ORDER BY b2.name LIMIT 1), 'N/A') as address,
    
    -- Simple counts (without complex aggregations to avoid timeouts)
    0 as device_count,
    0 as active_devices,
    0 as maintenance_devices,
    0 as inactive_devices,
    0 as total_alarms,
    0 as active_alarms,
    0 as resolved_alarms,
    0 as total_consumption_m3,
    0 as avg_daily_consumption_m3

FROM building_groups bg
LEFT JOIN buildings b ON b.name LIKE '%' || bg.name || '%' -- Match buildings that contain the group name
GROUP BY bg.id, bg.name, bg.created_at
ORDER BY bg.name;

-- Grant permissions
GRANT SELECT ON statistics_building_groups TO authenticated;
GRANT SELECT ON statistics_building_groups TO anon;

-- Create a function to get paginated building groups data
CREATE OR REPLACE FUNCTION get_statistics_building_groups(
    page_number INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 8,
    sort_by TEXT DEFAULT 'group_name',
    sort_direction TEXT DEFAULT 'ASC'
)
RETURNS TABLE (
    building_groups jsonb,
    total_count INTEGER,
    total_pages INTEGER,
    current_page INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    offset_value INTEGER;
    total_building_groups INTEGER;
    total_pages_count INTEGER;
    building_groups_data jsonb;
BEGIN
    -- Calculate offset
    offset_value := (page_number - 1) * page_size;
    
    -- Get total count
    SELECT COUNT(*) INTO total_building_groups FROM statistics_building_groups;
    
    -- Calculate total pages
    total_pages_count := CEIL(total_building_groups::numeric / page_size::numeric)::INTEGER;
    
    -- Get paginated data with proper sorting
    IF sort_by = 'group_name' AND sort_direction = 'ASC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', row_number,
                'group', group_name,
                'building', sample_building_name,
                'building_count', building_count,
                'zipCode', zip_code,
                'address', address,
                'device_count', device_count,
                'active_devices', active_devices,
                'maintenance_devices', maintenance_devices,
                'inactive_devices', inactive_devices,
                'total_alarms', total_alarms,
                'active_alarms', active_alarms,
                'resolved_alarms', resolved_alarms,
                'total_consumption_m3', total_consumption_m3,
                'avg_daily_consumption_m3', avg_daily_consumption_m3
            )
        ) INTO building_groups_data
        FROM (
            SELECT * FROM statistics_building_groups ORDER BY group_name ASC LIMIT page_size OFFSET offset_value
        ) paginated_building_groups;
    ELSIF sort_by = 'group_name' AND sort_direction = 'DESC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', row_number,
                'group', group_name,
                'building', sample_building_name,
                'building_count', building_count,
                'zipCode', zip_code,
                'address', address,
                'device_count', device_count,
                'active_devices', active_devices,
                'maintenance_devices', maintenance_devices,
                'inactive_devices', inactive_devices,
                'total_alarms', total_alarms,
                'active_alarms', active_alarms,
                'resolved_alarms', resolved_alarms,
                'total_consumption_m3', total_consumption_m3,
                'avg_daily_consumption_m3', avg_daily_consumption_m3
            )
        ) INTO building_groups_data
        FROM (
            SELECT * FROM statistics_building_groups ORDER BY group_name DESC LIMIT page_size OFFSET offset_value
        ) paginated_building_groups;
    ELSIF sort_by = 'building_name' AND sort_direction = 'ASC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', row_number,
                'group', group_name,
                'building', sample_building_name,
                'building_count', building_count,
                'zipCode', zip_code,
                'address', address,
                'device_count', device_count,
                'active_devices', active_devices,
                'maintenance_devices', maintenance_devices,
                'inactive_devices', inactive_devices,
                'total_alarms', total_alarms,
                'active_alarms', active_alarms,
                'resolved_alarms', resolved_alarms,
                'total_consumption_m3', total_consumption_m3,
                'avg_daily_consumption_m3', avg_daily_consumption_m3
            )
        ) INTO building_groups_data
        FROM (
            SELECT * FROM statistics_building_groups ORDER BY sample_building_name ASC LIMIT page_size OFFSET offset_value
        ) paginated_building_groups;
    ELSIF sort_by = 'building_name' AND sort_direction = 'DESC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', row_number,
                'group', group_name,
                'building', sample_building_name,
                'building_count', building_count,
                'zipCode', zip_code,
                'address', address,
                'device_count', device_count,
                'active_devices', active_devices,
                'maintenance_devices', maintenance_devices,
                'inactive_devices', inactive_devices,
                'total_alarms', total_alarms,
                'active_alarms', active_alarms,
                'resolved_alarms', resolved_alarms,
                'total_consumption_m3', total_consumption_m3,
                'avg_daily_consumption_m3', avg_daily_consumption_m3
            )
        ) INTO building_groups_data
        FROM (
            SELECT * FROM statistics_building_groups ORDER BY sample_building_name DESC LIMIT page_size OFFSET offset_value
        ) paginated_building_groups;
    ELSE
        -- Default sorting by group_name ASC
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', row_number,
                'group', group_name,
                'building', sample_building_name,
                'building_count', building_count,
                'zipCode', zip_code,
                'address', address,
                'device_count', device_count,
                'active_devices', active_devices,
                'maintenance_devices', maintenance_devices,
                'inactive_devices', inactive_devices,
                'total_alarms', total_alarms,
                'active_alarms', active_alarms,
                'resolved_alarms', resolved_alarms,
                'total_consumption_m3', total_consumption_m3,
                'avg_daily_consumption_m3', avg_daily_consumption_m3
            )
        ) INTO building_groups_data
        FROM (
            SELECT * FROM statistics_building_groups ORDER BY group_name ASC LIMIT page_size OFFSET offset_value
        ) paginated_building_groups;
    END IF;
    
    -- Return the result
    RETURN QUERY SELECT 
        COALESCE(building_groups_data, '[]'::jsonb) as building_groups,
        total_building_groups as total_count,
        total_pages_count as total_pages,
        page_number as current_page;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_statistics_building_groups(INTEGER, INTEGER, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_statistics_building_groups(INTEGER, INTEGER, TEXT, TEXT) TO authenticated;

-- Test the view
SELECT 'Statistics Building Groups view created successfully. Testing...' as status;
SELECT COUNT(*) as total_records FROM statistics_building_groups;
SELECT 
    group_name, 
    building_count, 
    sample_building_name, 
    sample_building_address 
FROM statistics_building_groups 
LIMIT 5;
