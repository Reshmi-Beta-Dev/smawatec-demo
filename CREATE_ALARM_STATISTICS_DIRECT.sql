-- Create alarm statistics function using direct table joins
-- This is more reliable than using views

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_alarm_statistics();

-- Create the function using direct table joins
CREATE OR REPLACE FUNCTION get_alarm_statistics()
RETURNS TABLE (
    major_alarms_current bigint,
    system_alarms_current bigint,
    total_leakage_alarms bigint,
    active_leakage_alarms bigint,
    total_estimated_loss_m3 numeric,
    total_water_saved_m3 numeric,
    alarms_last_24h bigint,
    resolved_alarms bigint,
    total_alarms bigint,
    latest_alarm_date timestamptz,
    earliest_alarm_date timestamptz
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 
        -- Current Active Alarms
        COUNT(CASE 
            WHEN a.status = 'active' AND at.severity = 'high' 
            THEN 1 
        END) as major_alarms_current,
        
        COUNT(CASE 
            WHEN a.status = 'active' AND at.severity IN ('medium', 'low') 
            THEN 1 
        END) as system_alarms_current,
        
        -- Total Leakage Alarms
        COUNT(CASE 
            WHEN LOWER(COALESCE(at.name, '')) LIKE '%leak%' 
            THEN 1 
        END) as total_leakage_alarms,
        
        COUNT(CASE 
            WHEN LOWER(COALESCE(at.name, '')) LIKE '%leak%' AND a.status = 'active'
            THEN 1 
        END) as active_leakage_alarms,
        
        -- Mock Water Loss Calculations
        COALESCE(COUNT(CASE WHEN LOWER(COALESCE(at.name, '')) LIKE '%leak%' THEN 1 END) * 15.5, 0) as total_estimated_loss_m3,
        COALESCE(COUNT(CASE WHEN LOWER(COALESCE(at.name, '')) LIKE '%leak%' AND a.status = 'resolved' THEN 1 END) * 8.2, 0) as total_water_saved_m3,
        
        -- Recent Activity
        COUNT(CASE 
            WHEN a.created_at >= NOW() - INTERVAL '24 hours' 
            THEN 1 
        END) as alarms_last_24h,
        
        -- Resolved Alarms
        COUNT(CASE 
            WHEN a.status = 'resolved' 
            THEN 1 
        END) as resolved_alarms,
        
        -- Total Alarms
        COUNT(*) as total_alarms,
        
        -- Timestamps
        MAX(a.created_at) as latest_alarm_date,
        MIN(a.created_at) as earliest_alarm_date

    FROM alarms a
    LEFT JOIN alarm_types at ON a.alarm_type_id = at.id;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_alarm_statistics() TO anon;
GRANT EXECUTE ON FUNCTION get_alarm_statistics() TO authenticated;

-- Test the function
SELECT 'Function created successfully. Testing...' as status;
SELECT * FROM get_alarm_statistics();
