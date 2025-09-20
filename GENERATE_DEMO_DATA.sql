-- =====================================================
-- DEMO DATA GENERATION SCRIPT FOR WATER MANAGEMENT SYSTEM
-- =====================================================
-- This script generates realistic demo data for a French water management system
-- Structure: Building Groups → Buildings → Apartments → Devices → Consumption → Alarms
-- Time Range: Past 7 years to future 1 year (8 years total)

-- Clear existing data (in correct order to respect foreign keys)
-- =====================================================
-- Disable foreign key checks temporarily for clean deletion
SET session_replication_role = replica;

-- Delete in reverse dependency order based on actual schema
DELETE FROM alarms;
DELETE FROM consumption_data;
DELETE FROM consumption; -- In case the table is named 'consumption' instead of 'consumption_data'
DELETE FROM devices;
DELETE FROM buildings;
DELETE FROM building_groups;
DELETE FROM alarm_types;

-- Note: Views (alarm_categories, alarms_message_board) are automatically updated
-- when underlying table data changes, so no need to delete from them

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Note: Tables use UUIDs, so sequences don't need resetting

-- =====================================================
-- 1. ALARM TYPES (Reference Data)
-- =====================================================
INSERT INTO alarm_types (name, severity, color) VALUES
-- Major Alarms (High Severity)
('Major Water Leak', 'high', '#dc2626'),
('Auto Shut-off Failure', 'high', '#dc2626'),
('Low Temperature Alert', 'high', '#dc2626'),
('Pressure Loss Critical', 'high', '#dc2626'),

-- Minor Alarms (Medium Severity)
('Minor Water Leak', 'medium', '#f59e0b'),
('Flow Anomaly', 'medium', '#f59e0b'),
('Temperature Fluctuation', 'medium', '#f59e0b'),

-- System Messages (Low Severity)
('WiFi Connection Lost', 'low', '#6b7280'),
('Power Loss', 'low', '#6b7280'),
('Valve Failure', 'low', '#6b7280'),
('Poor WiFi Signal', 'low', '#6b7280'),
('Device Offline', 'low', '#6b7280'),
('Maintenance Due', 'low', '#6b7280');


-- =====================================================
-- 2. BUILDING GROUPS (12 Groups)
-- =====================================================
INSERT INTO building_groups (name, created_at) VALUES
('Paris Centre - Groupe A', NOW() - INTERVAL '7 years'),
('Paris Centre - Groupe B', NOW() - INTERVAL '6 years 10 months'),
('Marais - Groupe A', NOW() - INTERVAL '6 years 8 months'),
('Marais - Groupe B', NOW() - INTERVAL '6 years 6 months'),
('Champs-Élysées - Groupe A', NOW() - INTERVAL '6 years 4 months'),
('Champs-Élysées - Groupe B', NOW() - INTERVAL '6 years 2 months'),
('Montmartre - Groupe A', NOW() - INTERVAL '6 years'),
('Montmartre - Groupe B', NOW() - INTERVAL '5 years 10 months'),
('Bastille - Groupe A', NOW() - INTERVAL '5 years 8 months'),
('Bastille - Groupe B', NOW() - INTERVAL '5 years 6 months'),
('Saint-Germain - Groupe A', NOW() - INTERVAL '5 years 4 months'),
('Saint-Germain - Groupe B', NOW() - INTERVAL '5 years 2 months');

-- =====================================================
-- 3. BUILDINGS (84 buildings total)
-- =====================================================
-- Generate buildings without building_group_id (not available in schema)
DO $$
DECLARE
    building_count INTEGER := 84; -- Total buildings to generate
    i INTEGER;
    street_names TEXT[] := ARRAY['Rue de Rivoli', 'Avenue des Champs-Élysées', 'Rue de la Paix', 'Boulevard Saint-Germain', 'Rue de Montmartre', 'Place de la Bastille', 'Rue de la Roquette', 'Avenue de l''Opéra', 'Rue de Rivoli', 'Boulevard Haussmann', 'Rue de la République', 'Place Vendôme'];
    arrondissements TEXT[] := ARRAY['75001', '75002', '75003', '75004', '75005', '75006', '75007', '75008', '75009', '75010', '75011', '75012'];
    group_names TEXT[] := ARRAY['Paris Centre', 'Marais', 'Champs-Élysées', 'Montmartre', 'Bastille', 'Saint-Germain'];
    group_index INTEGER;
BEGIN
    FOR i IN 1..building_count LOOP
        -- Cycle through group names
        group_index := ((i - 1) % array_length(group_names, 1)) + 1;
        
        INSERT INTO buildings (name, address, created_at) VALUES (
            'Bâtiment ' || group_names[group_index] || '-' || LPAD(i::TEXT, 3, '0'),
            street_names[1 + (random() * (array_length(street_names, 1) - 1))::INTEGER] || ', ' || (10 + (random() * 200))::INTEGER,
            NOW() - INTERVAL '7 years' + (random() * INTERVAL '2 years')
        );
    END LOOP;
END $$;

-- =====================================================
-- 4. DEVICES (1-4 devices per building, directly linked to buildings)
-- =====================================================

DO $$
DECLARE
    building_record RECORD;
    device_count INTEGER;
    i INTEGER;
    device_types TEXT[] := ARRAY['WaterMeter', 'FlowSensor', 'PressureSensor', 'TemperatureSensor'];
    device_statuses TEXT[] := ARRAY['active', 'maintenance', 'inactive'];
    serial_prefixes TEXT[] := ARRAY['WM', 'FS', 'PS', 'TS'];
    building_rank INTEGER;
BEGIN
    FOR building_record IN 
        SELECT b.id, b.name, ROW_NUMBER() OVER (ORDER BY b.id) as building_rank
        FROM buildings b 
        ORDER BY b.id
    LOOP
        -- First 42 buildings get 1 device, rest get 4 devices (simulating the original logic)
        IF building_record.building_rank <= 42 THEN
            device_count := 1;
        ELSE
            device_count := 4;
        END IF;
        
        -- Generate devices for this building
        FOR i IN 1..device_count LOOP
            INSERT INTO devices (building_id, serial_number, name, status) VALUES (
                building_record.id,
                serial_prefixes[1 + (random() * (array_length(serial_prefixes, 1) - 1))::INTEGER] || 
                '-' || 
                LPAD(building_record.id::TEXT, 3, '0') || 
                '-' || 
                LPAD(i::TEXT, 2, '0'),
                device_types[1 + (random() * (array_length(device_types, 1) - 1))::INTEGER] || ' ' || building_record.name,
                device_statuses[1 + (random() * (array_length(device_statuses, 1) - 1))::INTEGER]
            );
        END LOOP;
    END LOOP;
END $$;

-- =====================================================
-- 5. CONSUMPTION DATA (8 years: past 7 + future 1)
-- =====================================================
DO $$
DECLARE
    device_record RECORD;
    consumption_date DATE;
    base_consumption DECIMAL;
    daily_consumption DECIMAL;
    seasonal_factor DECIMAL;
    weekend_factor DECIMAL;
    random_factor DECIMAL;
    consumption_m3 DECIMAL;
    start_date DATE := CURRENT_DATE - INTERVAL '7 years';
    end_date DATE := CURRENT_DATE + INTERVAL '1 year';
    current_consumption_date DATE;
BEGIN
    FOR device_record IN SELECT id, building_id FROM devices ORDER BY id LOOP
        current_consumption_date := start_date;
        
        WHILE current_consumption_date <= end_date LOOP
            -- Base consumption (0.5 to 2.0 m³ per day)
            base_consumption := 0.5 + (random() * 1.5);
            
            -- Seasonal factor (higher in summer, lower in winter)
            seasonal_factor := 0.7 + 0.6 * (1 + COS(2 * PI() * EXTRACT(DOY FROM current_consumption_date) / 365.25)) / 2;
            
            -- Weekend factor (slightly higher on weekends)
            weekend_factor := CASE 
                WHEN EXTRACT(DOW FROM current_consumption_date) IN (0, 6) THEN 1.1
                ELSE 1.0
            END;
            
            -- Random factor (0.8 to 1.2)
            random_factor := 0.8 + (random() * 0.4);
            
            -- Calculate final consumption
            consumption_m3 := base_consumption * seasonal_factor * weekend_factor * random_factor;
            
            -- Insert consumption data
            INSERT INTO consumption_data (device_id, consumption_date, consumption_hour, consumption_m3, created_at) VALUES (
                device_record.id,
                current_consumption_date,
                12, -- Default to noon (12:00) for daily consumption
                ROUND(consumption_m3::DECIMAL, 3),
                NOW() - INTERVAL '7 years' + (random() * INTERVAL '2 years')
            );
            
            current_consumption_date := current_consumption_date + INTERVAL '1 day';
        END LOOP;
    END LOOP;
END $$;

-- =====================================================
-- 6. ALARMS (Realistic alarm generation)
-- =====================================================
DO $$
DECLARE
    device_record RECORD;
    alarm_type_record RECORD;
    alarm_date TIMESTAMP;
    alarm_count INTEGER;
    i INTEGER;
    alarm_types_count INTEGER;
    severity_weights INTEGER[] := ARRAY[1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3, 3]; -- More low severity alarms
    alarm_statuses TEXT[] := ARRAY['active', 'resolved', 'investigating'];
    messages TEXT[] := ARRAY[
        'Détection de fuite d''eau anormale',
        'Perte de pression dans le système',
        'Température de l''eau en dehors des limites',
        'Défaillance du système de fermeture automatique',
        'Perte de connexion WiFi',
        'Interruption d''alimentation électrique',
        'Dysfonctionnement de la vanne',
        'Signal WiFi faible détecté',
        'Appareil hors ligne',
        'Maintenance programmée requise',
        'Anomalie de débit détectée',
        'Variation de température anormale'
    ];
BEGIN
    -- Get alarm types count
    SELECT COUNT(*) INTO alarm_types_count FROM alarm_types;
    
    -- Generate alarms for each device
    FOR device_record IN SELECT id, building_id FROM devices ORDER BY id LOOP
        -- Generate 0-5 alarms per device over 7 years
        alarm_count := (random() * 6)::INTEGER;
        
        FOR i IN 1..alarm_count LOOP
            -- Random alarm type based on severity weights
            SELECT * INTO alarm_type_record 
            FROM alarm_types 
            ORDER BY RANDOM() 
            LIMIT 1;
            
            -- Random date within the last 7 years
            alarm_date := NOW() - INTERVAL '7 years' + (random() * INTERVAL '7 years');
            
            -- Insert alarm
            INSERT INTO alarms (device_id, building_id, alarm_type_id, message, status, created_at, resolved_at) VALUES (
                device_record.id,
                device_record.building_id,
                alarm_type_record.id,
                messages[1 + (random() * (array_length(messages, 1) - 1))::INTEGER],
                alarm_statuses[1 + (random() * (array_length(alarm_statuses, 1) - 1))::INTEGER],
                alarm_date,
                CASE 
                    WHEN alarm_statuses[1 + (random() * (array_length(alarm_statuses, 1) - 1))::INTEGER] = 'resolved' 
                    THEN alarm_date + (random() * INTERVAL '7 days')
                    ELSE NULL
                END
            );
        END LOOP;
    END LOOP;
END $$;

-- =====================================================
-- 7. UPDATE SEQUENCES
-- =====================================================
-- Note: Most tables use UUIDs, so sequences don't need updating
-- Only update sequences for tables that use integer IDs
-- (This will be determined by the actual table structure)

-- =====================================================
-- 8. VERIFICATION QUERIES
-- =====================================================
-- Display summary of generated data
SELECT 'Building Groups' as table_name, COUNT(*) as record_count FROM building_groups
UNION ALL
SELECT 'Buildings', COUNT(*) FROM buildings
UNION ALL
SELECT 'Devices', COUNT(*) FROM devices
UNION ALL
SELECT 'Alarm Types', COUNT(*) FROM alarm_types
UNION ALL
SELECT 'Consumption Records', COUNT(*) FROM consumption_data
UNION ALL
SELECT 'Alarms', COUNT(*) FROM alarms
ORDER BY table_name;

-- Show building and device counts
SELECT 
    'Total Buildings' as category,
    COUNT(b.id) as count
FROM buildings b
UNION ALL
SELECT 
    'Total Devices',
    COUNT(d.id)
FROM devices d
UNION ALL
SELECT 
    'Buildings with 1 Device',
    COUNT(*)
FROM (
    SELECT b.id, COUNT(d.id) as device_count
    FROM buildings b
    LEFT JOIN devices d ON b.id = d.building_id
    GROUP BY b.id
    HAVING COUNT(d.id) = 1
) single_device_buildings
UNION ALL
SELECT 
    'Buildings with 4 Devices',
    COUNT(*)
FROM (
    SELECT b.id, COUNT(d.id) as device_count
    FROM buildings b
    LEFT JOIN devices d ON b.id = d.building_id
    GROUP BY b.id
    HAVING COUNT(d.id) = 4
) multi_device_buildings;

-- Show consumption data range
SELECT 
    MIN(consumption_date) as earliest_date,
    MAX(consumption_date) as latest_date,
    COUNT(*) as total_records,
    ROUND(AVG(consumption_m3), 3) as avg_daily_consumption
FROM consumption_data;

-- Show alarm statistics
SELECT 
    at.name as alarm_type,
    at.severity,
    COUNT(a.id) as alarm_count,
    COUNT(CASE WHEN a.status = 'active' THEN 1 END) as active_count
FROM alarm_types at
LEFT JOIN alarms a ON at.id = a.alarm_type_id
GROUP BY at.id, at.name, at.severity
ORDER BY at.severity, alarm_count DESC;

COMMIT;
