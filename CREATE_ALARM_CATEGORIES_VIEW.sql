-- Create view for alarm categories (Major Alarms, Minor Alarms, System Messages)
-- This view categorizes alarms based on their severity and type

CREATE OR REPLACE VIEW alarm_categories AS
WITH alarm_counts AS (
  SELECT 
    CASE 
      WHEN at.severity = 'high' THEN 'major'
      WHEN at.severity = 'medium' THEN 'minor'
      WHEN LOWER(COALESCE(at.name, '')) LIKE '%wifi%' OR LOWER(COALESCE(at.name, '')) LIKE '%power%' OR LOWER(COALESCE(at.name, '')) LIKE '%valve%' OR LOWER(COALESCE(at.name, '')) LIKE '%connection%' THEN 'system'
      ELSE 'minor'
    END as category,
    at.name,
    at.severity,
    COUNT(*) as count
  FROM alarms a
  LEFT JOIN alarm_types at ON a.alarm_type_id = at.id
  WHERE a.resolved_at IS NULL  -- Only active alarms
  GROUP BY at.severity, at.name
),
major_alarms AS (
  SELECT 
    'major' as category,
    COALESCE(SUM(CASE WHEN LOWER(name) LIKE '%leak%' AND severity = 'high' THEN count ELSE 0 END), 0) as major_leaks,
    COALESCE(SUM(CASE WHEN LOWER(name) LIKE '%shut%' AND severity = 'high' THEN count ELSE 0 END), 0) as auto_shutoff_non_resolved,
    COALESCE(SUM(CASE WHEN LOWER(name) LIKE '%temp%' AND severity = 'high' THEN count ELSE 0 END), 0) as low_temperature
  FROM alarm_counts
  WHERE category = 'major'
),
minor_alarms AS (
  SELECT 
    'minor' as category,
    COALESCE(SUM(CASE WHEN LOWER(name) LIKE '%leak%' AND severity = 'medium' THEN count ELSE 0 END), 0) as medium_leaks,
    COALESCE(SUM(CASE WHEN LOWER(name) LIKE '%leak%' AND severity = 'low' THEN count ELSE 0 END), 0) as minor_leaks
  FROM alarm_counts
  WHERE category = 'minor'
),
system_messages AS (
  SELECT 
    'system' as category,
    COALESCE(SUM(CASE WHEN LOWER(name) LIKE '%wifi%' AND LOWER(name) LIKE '%lost%' THEN count ELSE 0 END), 0) as wifi_connection_lost,
    COALESCE(SUM(CASE WHEN LOWER(name) LIKE '%power%' AND LOWER(name) LIKE '%loss%' THEN count ELSE 0 END), 0) as power_loss,
    COALESCE(SUM(CASE WHEN LOWER(name) LIKE '%valve%' AND LOWER(name) LIKE '%fail%' THEN count ELSE 0 END), 0) as valve_failure,
    COALESCE(SUM(CASE WHEN LOWER(name) LIKE '%wifi%' AND LOWER(name) LIKE '%poor%' THEN count ELSE 0 END), 0) as poor_wifi
  FROM alarm_counts
  WHERE category = 'system'
)
SELECT 
  'major' as category_type,
  major_leaks as major_leaks,
  auto_shutoff_non_resolved as auto_shutoff_non_resolved,
  low_temperature as low_temperature,
  0 as medium_leaks,
  0 as minor_leaks,
  0 as wifi_connection_lost,
  0 as power_loss,
  0 as valve_failure,
  0 as poor_wifi
FROM major_alarms

UNION ALL

SELECT 
  'minor' as category_type,
  0 as major_leaks,
  0 as auto_shutoff_non_resolved,
  0 as low_temperature,
  medium_leaks as medium_leaks,
  minor_leaks as minor_leaks,
  0 as wifi_connection_lost,
  0 as power_loss,
  0 as valve_failure,
  0 as poor_wifi
FROM minor_alarms

UNION ALL

SELECT 
  'system' as category_type,
  0 as major_leaks,
  0 as auto_shutoff_non_resolved,
  0 as low_temperature,
  0 as medium_leaks,
  0 as minor_leaks,
  wifi_connection_lost as wifi_connection_lost,
  power_loss as power_loss,
  valve_failure as valve_failure,
  poor_wifi as poor_wifi
FROM system_messages;

-- Grant permissions
GRANT SELECT ON alarm_categories TO authenticated;
GRANT SELECT ON alarm_categories TO anon;

-- Create a function to get alarm categories as JSON
CREATE OR REPLACE FUNCTION get_alarm_categories()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'category_type', category_type,
      'major_leaks', major_leaks,
      'auto_shutoff_non_resolved', auto_shutoff_non_resolved,
      'low_temperature', low_temperature,
      'medium_leaks', medium_leaks,
      'minor_leaks', minor_leaks,
      'wifi_connection_lost', wifi_connection_lost,
      'power_loss', power_loss,
      'valve_failure', valve_failure,
      'poor_wifi', poor_wifi
    )
  ) INTO result
  FROM alarm_categories;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_alarm_categories() TO authenticated;
GRANT EXECUTE ON FUNCTION get_alarm_categories() TO anon;
