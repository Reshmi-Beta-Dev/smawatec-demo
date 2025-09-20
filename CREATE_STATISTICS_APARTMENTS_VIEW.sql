-- Create view for Statistics page Apartment grid
-- This view provides apartment data with associated devices and tenant information

-- Drop existing view if it exists
DROP VIEW IF EXISTS statistics_apartments CASCADE;

-- Create the apartments statistics view
CREATE OR REPLACE VIEW statistics_apartments AS
SELECT 
    -- Row number for pagination
    ROW_NUMBER() OVER (ORDER BY d.name) as row_number,
    
    -- Apartment information (using device name as apartment identifier)
    d.id as apartment_id,
    d.name as apartment,
    d.serial_number as tenant,
    
    -- Building information
    b.name as building_name,
    b.address as building_address,
    b.id as building_id,
    
    -- Device status information
    d.status as device_status,
    d.created_at as device_created_at

FROM devices d
LEFT JOIN buildings b ON d.building_id = b.id
ORDER BY d.name;

-- Grant permissions
GRANT SELECT ON statistics_apartments TO authenticated;
GRANT SELECT ON statistics_apartments TO anon;

-- Create a function to get paginated apartments data
CREATE OR REPLACE FUNCTION get_statistics_apartments(
    page_number INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 8,
    sort_by TEXT DEFAULT 'apartment',
    sort_direction TEXT DEFAULT 'ASC'
)
RETURNS TABLE (
    apartments jsonb,
    total_count INTEGER,
    total_pages INTEGER,
    current_page INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    offset_value INTEGER;
    total_apartments INTEGER;
    total_pages_count INTEGER;
    apartments_data jsonb;
BEGIN
    -- Calculate offset
    offset_value := (page_number - 1) * page_size;
    
    -- Get total count
    SELECT COUNT(*) INTO total_apartments FROM statistics_apartments;
    
    -- Calculate total pages
    total_pages_count := CEIL(total_apartments::numeric / page_size::numeric)::INTEGER;
    
    -- Get paginated data with proper sorting
    IF sort_by = 'apartment' AND sort_direction = 'ASC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', row_number,
                'apartment', apartment,
                'tenant', tenant,
                'building_name', building_name,
                'building_address', building_address,
                'device_status', device_status
            )
        ) INTO apartments_data
        FROM (
            SELECT * FROM statistics_apartments ORDER BY apartment ASC LIMIT page_size OFFSET offset_value
        ) paginated_apartments;
    ELSIF sort_by = 'apartment' AND sort_direction = 'DESC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', row_number,
                'apartment', apartment,
                'tenant', tenant,
                'building_name', building_name,
                'building_address', building_address,
                'device_status', device_status
            )
        ) INTO apartments_data
        FROM (
            SELECT * FROM statistics_apartments ORDER BY apartment DESC LIMIT page_size OFFSET offset_value
        ) paginated_apartments;
    ELSIF sort_by = 'tenant' AND sort_direction = 'ASC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', row_number,
                'apartment', apartment,
                'tenant', tenant,
                'building_name', building_name,
                'building_address', building_address,
                'device_status', device_status
            )
        ) INTO apartments_data
        FROM (
            SELECT * FROM statistics_apartments ORDER BY tenant ASC LIMIT page_size OFFSET offset_value
        ) paginated_apartments;
    ELSIF sort_by = 'tenant' AND sort_direction = 'DESC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', row_number,
                'apartment', apartment,
                'tenant', tenant,
                'building_name', building_name,
                'building_address', building_address,
                'device_status', device_status
            )
        ) INTO apartments_data
        FROM (
            SELECT * FROM statistics_apartments ORDER BY tenant DESC LIMIT page_size OFFSET offset_value
        ) paginated_apartments;
    ELSIF sort_by = 'building_name' AND sort_direction = 'ASC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', row_number,
                'apartment', apartment,
                'tenant', tenant,
                'building_name', building_name,
                'building_address', building_address,
                'device_status', device_status
            )
        ) INTO apartments_data
        FROM (
            SELECT * FROM statistics_apartments ORDER BY building_name ASC LIMIT page_size OFFSET offset_value
        ) paginated_apartments;
    ELSIF sort_by = 'building_name' AND sort_direction = 'DESC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', row_number,
                'apartment', apartment,
                'tenant', tenant,
                'building_name', building_name,
                'building_address', building_address,
                'device_status', device_status
            )
        ) INTO apartments_data
        FROM (
            SELECT * FROM statistics_apartments ORDER BY building_name DESC LIMIT page_size OFFSET offset_value
        ) paginated_apartments;
    ELSE
        -- Default sorting by apartment ASC
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', row_number,
                'apartment', apartment,
                'tenant', tenant,
                'building_name', building_name,
                'building_address', building_address,
                'device_status', device_status
            )
        ) INTO apartments_data
        FROM (
            SELECT * FROM statistics_apartments ORDER BY apartment ASC LIMIT page_size OFFSET offset_value
        ) paginated_apartments;
    END IF;
    
    -- Return the result
    RETURN QUERY SELECT 
        COALESCE(apartments_data, '[]'::jsonb) as apartments,
        total_apartments as total_count,
        total_pages_count as total_pages,
        page_number as current_page;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_statistics_apartments(INTEGER, INTEGER, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_statistics_apartments(INTEGER, INTEGER, TEXT, TEXT) TO authenticated;

-- Test the view
SELECT 'Statistics Apartments view created successfully. Testing...' as status;
SELECT COUNT(*) as total_records FROM statistics_apartments;
SELECT * FROM statistics_apartments LIMIT 5;
