-- Create view for Alarms Message Board Grid
-- This view provides all necessary data for the alarms message board table

-- Drop existing views and dependencies in correct order
DROP VIEW IF EXISTS alarm_statistics CASCADE;
DROP VIEW IF EXISTS alarms_message_board CASCADE;

CREATE OR REPLACE VIEW alarms_message_board AS
SELECT 
    a.id,
    a.device_id,
    a.building_id,
    a.alarm_type_id,
    a.message,
    a.status,
    a.created_at,
    a.resolved_at,
    
    -- Device information
    d.serial_number as device_serial,
    d.name as device_name,
    d.status as device_status,
    
    -- Building information
    b.name as building_name,
    b.address as building_address,
    NULL as building_group_name, -- Building groups not available in current schema
    
    -- Alarm type information
    at.name as alarm_type_name,
    at.severity as alarm_severity,
    at.color as alarm_color
    
FROM alarms a
LEFT JOIN devices d ON a.device_id = d.id
LEFT JOIN buildings b ON a.building_id = b.id
LEFT JOIN alarm_types at ON a.alarm_type_id = at.id
ORDER BY a.created_at DESC;

-- Grant permissions
GRANT SELECT ON alarms_message_board TO authenticated;
GRANT SELECT ON alarms_message_board TO anon;

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_alarms_message_board(INTEGER, INTEGER, TEXT, TEXT);
DROP FUNCTION IF EXISTS get_alarms_message_board_simple();

-- Create a function to get paginated alarms data
CREATE OR REPLACE FUNCTION get_alarms_message_board(
    page_number INTEGER DEFAULT 1,
    page_size INTEGER DEFAULT 10,
    sort_by TEXT DEFAULT 'created_at',
    sort_direction TEXT DEFAULT 'DESC'
)
RETURNS TABLE (
    alarms jsonb,
    total_count INTEGER,
    total_pages INTEGER,
    current_page INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    offset_value INTEGER;
    total_alarms INTEGER;
    total_pages_count INTEGER;
    alarms_data jsonb;
BEGIN
    -- Calculate offset
    offset_value := (page_number - 1) * page_size;
    
    -- Get total count
    SELECT COUNT(*) INTO total_alarms FROM alarms_message_board;
    
    -- Calculate total pages
    total_pages_count := CEIL(total_alarms::numeric / page_size::numeric)::INTEGER;
    
    -- Get paginated data with proper sorting using separate conditions
    IF sort_by = 'created_at' AND sort_direction = 'ASC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', id, 'device_id', device_id, 'building_id', building_id, 'alarm_type_id', alarm_type_id,
                'message', message, 'status', status, 'created_at', created_at, 'resolved_at', resolved_at,
                'device_serial', device_serial, 'device_name', device_name, 'device_status', device_status,
                'building_name', building_name, 'building_address', building_address, 'building_group_name', building_group_name,
                'alarm_type_name', alarm_type_name, 'alarm_severity', alarm_severity, 'alarm_color', alarm_color
            )
        ) INTO alarms_data
        FROM (
            SELECT * FROM alarms_message_board ORDER BY created_at ASC LIMIT page_size OFFSET offset_value
        ) paginated_alarms;
    ELSIF sort_by = 'created_at' AND sort_direction = 'DESC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', id, 'device_id', device_id, 'building_id', building_id, 'alarm_type_id', alarm_type_id,
                'message', message, 'status', status, 'created_at', created_at, 'resolved_at', resolved_at,
                'device_serial', device_serial, 'device_name', device_name, 'device_status', device_status,
                'building_name', building_name, 'building_address', building_address, 'building_group_name', building_group_name,
                'alarm_type_name', alarm_type_name, 'alarm_severity', alarm_severity, 'alarm_color', alarm_color
            )
        ) INTO alarms_data
        FROM (
            SELECT * FROM alarms_message_board ORDER BY created_at DESC LIMIT page_size OFFSET offset_value
        ) paginated_alarms;
    ELSIF sort_by = 'building_name' AND sort_direction = 'ASC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', id, 'device_id', device_id, 'building_id', building_id, 'alarm_type_id', alarm_type_id,
                'message', message, 'status', status, 'created_at', created_at, 'resolved_at', resolved_at,
                'device_serial', device_serial, 'device_name', device_name, 'device_status', device_status,
                'building_name', building_name, 'building_address', building_address, 'building_group_name', building_group_name,
                'alarm_type_name', alarm_type_name, 'alarm_severity', alarm_severity, 'alarm_color', alarm_color
            )
        ) INTO alarms_data
        FROM (
            SELECT * FROM alarms_message_board ORDER BY building_name ASC LIMIT page_size OFFSET offset_value
        ) paginated_alarms;
    ELSIF sort_by = 'building_name' AND sort_direction = 'DESC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', id, 'device_id', device_id, 'building_id', building_id, 'alarm_type_id', alarm_type_id,
                'message', message, 'status', status, 'created_at', created_at, 'resolved_at', resolved_at,
                'device_serial', device_serial, 'device_name', device_name, 'device_status', device_status,
                'building_name', building_name, 'building_address', building_address, 'building_group_name', building_group_name,
                'alarm_type_name', alarm_type_name, 'alarm_severity', alarm_severity, 'alarm_color', alarm_color
            )
        ) INTO alarms_data
        FROM (
            SELECT * FROM alarms_message_board ORDER BY building_name DESC LIMIT page_size OFFSET offset_value
        ) paginated_alarms;
    ELSIF sort_by = 'alarm_type_name' AND sort_direction = 'ASC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', id, 'device_id', device_id, 'building_id', building_id, 'alarm_type_id', alarm_type_id,
                'message', message, 'status', status, 'created_at', created_at, 'resolved_at', resolved_at,
                'device_serial', device_serial, 'device_name', device_name, 'device_status', device_status,
                'building_name', building_name, 'building_address', building_address, 'building_group_name', building_group_name,
                'alarm_type_name', alarm_type_name, 'alarm_severity', alarm_severity, 'alarm_color', alarm_color
            )
        ) INTO alarms_data
        FROM (
            SELECT * FROM alarms_message_board ORDER BY alarm_type_name ASC LIMIT page_size OFFSET offset_value
        ) paginated_alarms;
    ELSIF sort_by = 'alarm_type_name' AND sort_direction = 'DESC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', id, 'device_id', device_id, 'building_id', building_id, 'alarm_type_id', alarm_type_id,
                'message', message, 'status', status, 'created_at', created_at, 'resolved_at', resolved_at,
                'device_serial', device_serial, 'device_name', device_name, 'device_status', device_status,
                'building_name', building_name, 'building_address', building_address, 'building_group_name', building_group_name,
                'alarm_type_name', alarm_type_name, 'alarm_severity', alarm_severity, 'alarm_color', alarm_color
            )
        ) INTO alarms_data
        FROM (
            SELECT * FROM alarms_message_board ORDER BY alarm_type_name DESC LIMIT page_size OFFSET offset_value
        ) paginated_alarms;
    ELSIF sort_by = 'status' AND sort_direction = 'ASC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', id, 'device_id', device_id, 'building_id', building_id, 'alarm_type_id', alarm_type_id,
                'message', message, 'status', status, 'created_at', created_at, 'resolved_at', resolved_at,
                'device_serial', device_serial, 'device_name', device_name, 'device_status', device_status,
                'building_name', building_name, 'building_address', building_address, 'building_group_name', building_group_name,
                'alarm_type_name', alarm_type_name, 'alarm_severity', alarm_severity, 'alarm_color', alarm_color
            )
        ) INTO alarms_data
        FROM (
            SELECT * FROM alarms_message_board ORDER BY status ASC LIMIT page_size OFFSET offset_value
        ) paginated_alarms;
    ELSIF sort_by = 'status' AND sort_direction = 'DESC' THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', id, 'device_id', device_id, 'building_id', building_id, 'alarm_type_id', alarm_type_id,
                'message', message, 'status', status, 'created_at', created_at, 'resolved_at', resolved_at,
                'device_serial', device_serial, 'device_name', device_name, 'device_status', device_status,
                'building_name', building_name, 'building_address', building_address, 'building_group_name', building_group_name,
                'alarm_type_name', alarm_type_name, 'alarm_severity', alarm_severity, 'alarm_color', alarm_color
            )
        ) INTO alarms_data
        FROM (
            SELECT * FROM alarms_message_board ORDER BY status DESC LIMIT page_size OFFSET offset_value
        ) paginated_alarms;
    ELSE
        -- Default sorting by created_at DESC
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', id, 'device_id', device_id, 'building_id', building_id, 'alarm_type_id', alarm_type_id,
                'message', message, 'status', status, 'created_at', created_at, 'resolved_at', resolved_at,
                'device_serial', device_serial, 'device_name', device_name, 'device_status', device_status,
                'building_name', building_name, 'building_address', building_address, 'building_group_name', building_group_name,
                'alarm_type_name', alarm_type_name, 'alarm_severity', alarm_severity, 'alarm_color', alarm_color
            )
        ) INTO alarms_data
        FROM (
            SELECT * FROM alarms_message_board ORDER BY created_at DESC LIMIT page_size OFFSET offset_value
        ) paginated_alarms;
    END IF;
    
    -- Return the result
    RETURN QUERY SELECT 
        COALESCE(alarms_data, '[]'::jsonb) as alarms,
        total_alarms as total_count,
        total_pages_count as total_pages,
        page_number as current_page;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_alarms_message_board(INTEGER, INTEGER, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_alarms_message_board(INTEGER, INTEGER, TEXT, TEXT) TO anon;

-- Create a simpler function for basic alarms data (for backward compatibility)
CREATE OR REPLACE FUNCTION get_alarms_message_board_simple()
RETURNS TABLE (
    id text,
    device_id text,
    building_id text,
    alarm_type_id text,
    message text,
    status text,
    created_at timestamptz,
    resolved_at timestamptz,
    device_serial text,
    device_name text,
    device_status text,
    building_name text,
    building_address text,
    building_group_name text,
    alarm_type_name text,
    alarm_severity text,
    alarm_color text
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 
        a.id,
        a.device_id,
        a.building_id,
        a.alarm_type_id,
        a.message,
        a.status,
        a.created_at,
        a.resolved_at,
        d.serial_number as device_serial,
        d.name as device_name,
        d.status as device_status,
        b.name as building_name,
        b.address as building_address,
        NULL as building_group_name, -- Building groups not available in current schema
        at.name as alarm_type_name,
        at.severity as alarm_severity,
        at.color as alarm_color
    FROM alarms a
    LEFT JOIN devices d ON a.device_id = d.id
    LEFT JOIN buildings b ON a.building_id = b.id
    LEFT JOIN alarm_types at ON a.alarm_type_id = at.id
    ORDER BY a.created_at DESC;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_alarms_message_board_simple() TO authenticated;
GRANT EXECUTE ON FUNCTION get_alarms_message_board_simple() TO anon;

-- Recreate alarm_statistics view that depends on alarms_message_board
CREATE OR REPLACE VIEW alarm_statistics AS
SELECT 
    COUNT(CASE WHEN a.status = 'active' AND at.severity = 'high' THEN 1 END) as major_alarms_current,
    COUNT(CASE WHEN a.status = 'active' AND at.severity IN ('medium', 'low') THEN 1 END) as system_alarms_current,
    COUNT(CASE WHEN LOWER(COALESCE(at.name, '')) LIKE '%leak%' THEN 1 END) as total_leakage_alarms,
    COUNT(CASE WHEN LOWER(COALESCE(at.name, '')) LIKE '%leak%' AND a.status = 'active' THEN 1 END) as active_leakage_alarms,
    COALESCE(COUNT(CASE WHEN LOWER(COALESCE(at.name, '')) LIKE '%leak%' THEN 1 END) * 15.5, 0) as total_estimated_loss_m3,
    COALESCE(COUNT(CASE WHEN LOWER(COALESCE(at.name, '')) LIKE '%leak%' AND a.status = 'resolved' THEN 1 END) * 8.2, 0) as total_water_saved_m3,
    COUNT(CASE WHEN a.created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as alarms_last_24h,
    COUNT(CASE WHEN a.status = 'resolved' THEN 1 END) as resolved_alarms,
    COUNT(*) as total_alarms,
    MAX(a.created_at) as latest_alarm_date,
    MIN(a.created_at) as earliest_alarm_date
FROM alarms_message_board a
LEFT JOIN alarm_types at ON a.alarm_type_id = at.id;

-- Grant permissions for alarm_statistics
GRANT SELECT ON alarm_statistics TO authenticated;
GRANT SELECT ON alarm_statistics TO anon;

-- Test the functions
SELECT 'Alarms Message Board view and functions created successfully. Testing...' as status;

-- Test the view
SELECT COUNT(*) as total_alarms FROM alarms_message_board;

-- Test the simple function
SELECT COUNT(*) as simple_function_count FROM get_alarms_message_board_simple();

-- Test the paginated function
SELECT * FROM get_alarms_message_board(1, 10, 'created_at', 'DESC');