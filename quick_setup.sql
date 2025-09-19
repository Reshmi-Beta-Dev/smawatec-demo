-- =====================================================
-- SMAWATEC Quick Setup Script
-- Run this single script to set up the entire database
-- =====================================================

-- First run the schema
\i supabase_schema.sql

-- Then run the sample data (working version with DO blocks)
\i supabase_sample_data_simple.sql

-- Optional: Add 7 years of historical data
-- \i supabase_7_years_consumption_data.sql

-- Verify setup
SELECT 'Database setup completed successfully!' as status;

-- Show table counts
SELECT 
    'building_groups' as table_name, COUNT(*) as record_count FROM building_groups
UNION ALL
SELECT 'buildings', COUNT(*) FROM buildings
UNION ALL
SELECT 'tenants', COUNT(*) FROM tenants
UNION ALL
SELECT 'apartments', COUNT(*) FROM apartments
UNION ALL
SELECT 'devices', COUNT(*) FROM devices
UNION ALL
SELECT 'alarms', COUNT(*) FROM alarms
UNION ALL
SELECT 'daily_consumption', COUNT(*) FROM daily_consumption
UNION ALL
SELECT 'users', COUNT(*) FROM users
ORDER BY table_name;
