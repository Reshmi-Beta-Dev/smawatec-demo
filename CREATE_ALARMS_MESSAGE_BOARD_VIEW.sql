-- Create the alarms_message_board view for the Angular app
-- This view denormalizes alarm data for easy consumption

-- Drop the view if it exists
DROP VIEW IF EXISTS alarms_message_board;

-- Create the view
CREATE VIEW alarms_message_board AS
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
    b.building_name,
    b.street_number || ', ' || COALESCE(b.additional_address, '') || ', ' || b.zip_code || ' ' || b.city as building_address,
    bg.group_name as building_group_name,
    
    -- Alarm type information
    at.alarm_name as alarm_type_name,
    at.severity as alarm_severity,
    at.color_code as alarm_color
    
FROM alarms a
LEFT JOIN devices d ON a.device_id = d.id
LEFT JOIN buildings b ON a.building_id = b.id
LEFT JOIN building_groups bg ON b.building_group_id = bg.id
LEFT JOIN alarm_types at ON a.alarm_type_id = at.id;

-- Grant permissions for the view
GRANT SELECT ON alarms_message_board TO anon;
GRANT SELECT ON alarms_message_board TO authenticated;

-- Test the view
SELECT 'View created successfully. Sample data:' as info;
SELECT * FROM alarms_message_board LIMIT 3;
