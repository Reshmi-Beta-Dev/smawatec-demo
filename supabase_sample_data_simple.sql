-- =====================================================
-- SMAWATEC Water Management System - Sample Data (SIMPLE VERSION)
-- Uses uuid_generate_v4() to avoid UUID format issues
-- =====================================================

-- =====================================================
-- CITIES DATA
-- =====================================================
INSERT INTO cities (name, country_code, region) VALUES
('Paris', 'FR', 'Île-de-France'),
('Lyon', 'FR', 'Auvergne-Rhône-Alpes'),
('Marseille', 'FR', 'Provence-Alpes-Côte d''Azur');

-- =====================================================
-- BUILDING GROUPS DATA
-- =====================================================
INSERT INTO building_groups (group_name, description) VALUES
('PAR - GP1', 'Paris Group 1 - Champs Elysees Area'),
('PAR - GP2', 'Paris Group 2 - Marais District'),
('PAR - GP3', 'Paris Group 3 - Montmartre Area'),
('PAR - GP4', 'Paris Group 4 - Latin Quarter'),
('PAR - GP5', 'Paris Group 5 - Saint-Germain'),
('PAR - GP6', 'Paris Group 6 - Belleville'),
('PAR - GP7', 'Paris Group 7 - Bastille'),
('PAR - GP8', 'Paris Group 8 - République');

-- =====================================================
-- BUILDINGS DATA
-- =====================================================
-- Get the Paris city ID first
DO $$
DECLARE
    paris_city_id UUID;
    gp1_id UUID;
    gp2_id UUID;
    gp3_id UUID;
    gp4_id UUID;
BEGIN
    -- Get city ID
    SELECT id INTO paris_city_id FROM cities WHERE name = 'Paris';
    
    -- Get building group IDs
    SELECT id INTO gp1_id FROM building_groups WHERE group_name = 'PAR - GP1';
    SELECT id INTO gp2_id FROM building_groups WHERE group_name = 'PAR - GP2';
    SELECT id INTO gp3_id FROM building_groups WHERE group_name = 'PAR - GP3';
    SELECT id INTO gp4_id FROM building_groups WHERE group_name = 'PAR - GP4';
    
    -- Insert buildings
    INSERT INTO buildings (building_name, street_number, additional_address, zip_code, city, building_group_id, city_id) VALUES
    ('PAR-GP1-B12012', 'Rue de la Place', 'Champs Elysees', '23212', 'Paris', gp1_id, paris_city_id),
    ('PAR-GP1-B12013', 'Rue de la Place', 'Champs Elysees', '23213', 'Paris', gp1_id, paris_city_id),
    ('PAR-GP2-B12014', 'Rue de Rivoli', 'Marais', '23214', 'Paris', gp2_id, paris_city_id),
    ('PAR-GP2-B12015', 'Rue de Rivoli', 'Marais', '23215', 'Paris', gp2_id, paris_city_id),
    ('PAR-GP3-B12016', 'Rue des Abbesses', 'Montmartre', '23216', 'Paris', gp3_id, paris_city_id),
    ('PAR-GP3-B12017', 'Rue des Abbesses', 'Montmartre', '23217', 'Paris', gp3_id, paris_city_id),
    ('PAR-GP4-B12018', 'Boulevard Saint-Michel', 'Latin Quarter', '23218', 'Paris', gp4_id, paris_city_id),
    ('PAR-GP4-B12019', 'Boulevard Saint-Michel', 'Latin Quarter', '23219', 'Paris', gp4_id, paris_city_id);
END $$;

-- =====================================================
-- TENANTS DATA
-- =====================================================
INSERT INTO tenants (salutation, surname, first_name, telephone, mobile, email, water_price_per_m3) VALUES
('Mr', 'Duvall', 'Francis', '0489322892', '07489322892', 'F.Duvall@chv-fr.fr', 2.32),
('Mr', 'Bonaparte', 'Napoleon', '0489322893', '07489322893', 'N.Bonaparte@chv-fr.fr', 2.32),
('Mr', 'Mitterand', 'Francois', '0489322894', '07489322894', 'F.Mitterand@chv-fr.fr', 2.32),
('Mme', 'Chevalier', 'Marie', '0489322895', '07489322895', 'M.Chevalier@chv-fr.fr', 2.32),
('Mr', 'Dubois', 'Pierre', '0489322896', '07489322896', 'P.Dubois@chv-fr.fr', 2.32),
('Mme', 'Martin', 'Sophie', '0489322897', '07489322897', 'S.Martin@chv-fr.fr', 2.32),
('Mr', 'Leroy', 'Jean', '0489322898', '07489322898', 'J.Leroy@chv-fr.fr', 2.32),
('Mme', 'Moreau', 'Claire', '0489322899', '07489322899', 'C.Moreau@chv-fr.fr', 2.32);

-- =====================================================
-- APARTMENTS DATA
-- =====================================================
DO $$
DECLARE
    b12012_id UUID;
    b12013_id UUID;
    b12014_id UUID;
    duvall_id UUID;
    bonaparte_id UUID;
    mitterand_id UUID;
    chevalier_id UUID;
    dubois_id UUID;
    martin_id UUID;
    leroy_id UUID;
    moreau_id UUID;
BEGIN
    -- Get building IDs
    SELECT id INTO b12012_id FROM buildings WHERE building_name = 'PAR-GP1-B12012';
    SELECT id INTO b12013_id FROM buildings WHERE building_name = 'PAR-GP1-B12013';
    SELECT id INTO b12014_id FROM buildings WHERE building_name = 'PAR-GP2-B12014';
    
    -- Get tenant IDs
    SELECT id INTO duvall_id FROM tenants WHERE email = 'F.Duvall@chv-fr.fr';
    SELECT id INTO bonaparte_id FROM tenants WHERE email = 'N.Bonaparte@chv-fr.fr';
    SELECT id INTO mitterand_id FROM tenants WHERE email = 'F.Mitterand@chv-fr.fr';
    SELECT id INTO chevalier_id FROM tenants WHERE email = 'M.Chevalier@chv-fr.fr';
    SELECT id INTO dubois_id FROM tenants WHERE email = 'P.Dubois@chv-fr.fr';
    SELECT id INTO martin_id FROM tenants WHERE email = 'S.Martin@chv-fr.fr';
    SELECT id INTO leroy_id FROM tenants WHERE email = 'J.Leroy@chv-fr.fr';
    SELECT id INTO moreau_id FROM tenants WHERE email = 'C.Moreau@chv-fr.fr';
    
    -- Insert apartments
    INSERT INTO apartments (building_id, apartment_name, tenant_id, serial_number, block, level, apartment_number) VALUES
    (b12012_id, 'Block 1, L23, Apt 12', duvall_id, 'SM239012930', 'Block 1', 'L23', 'Apt 12'),
    (b12012_id, 'Block 1, L23, Apt 13', bonaparte_id, 'SM239012931', 'Block 1', 'L23', 'Apt 13'),
    (b12012_id, 'Block 1, L23, Apt 14', mitterand_id, 'SM239012932', 'Block 1', 'L23', 'Apt 14'),
    (b12012_id, 'Block 1, L23, Apt 15', chevalier_id, 'SM239012933', 'Block 1', 'L23', 'Apt 15'),
    (b12013_id, 'Block 2, L15, Apt 8', dubois_id, 'SM239012934', 'Block 2', 'L15', 'Apt 8'),
    (b12013_id, 'Block 2, L15, Apt 9', martin_id, 'SM239012935', 'Block 2', 'L15', 'Apt 9'),
    (b12014_id, 'Block 3, L8, Apt 22', leroy_id, 'SM239012936', 'Block 3', 'L8', 'Apt 22'),
    (b12014_id, 'Block 3, L8, Apt 23', moreau_id, 'SM239012937', 'Block 3', 'L8', 'Apt 23');
END $$;

-- =====================================================
-- DEVICE TYPES DATA
-- =====================================================
INSERT INTO device_types (type_name, description, manufacturer, model) VALUES
('Water Meter', 'Digital water consumption meter', 'SMAWATEC', 'SM-2024'),
('Leak Detector', 'Smart leak detection sensor', 'SMAWATEC', 'LD-2024'),
('Valve Controller', 'Remote water valve control', 'SMAWATEC', 'VC-2024');

-- =====================================================
-- DEVICES DATA
-- =====================================================
DO $$
DECLARE
    water_meter_type_id UUID;
    apt_930_id UUID;
    apt_931_id UUID;
    apt_932_id UUID;
    apt_933_id UUID;
    apt_934_id UUID;
    apt_935_id UUID;
    apt_936_id UUID;
    apt_937_id UUID;
BEGIN
    -- Get device type ID
    SELECT id INTO water_meter_type_id FROM device_types WHERE type_name = 'Water Meter';
    
    -- Get apartment IDs
    SELECT id INTO apt_930_id FROM apartments WHERE serial_number = 'SM239012930';
    SELECT id INTO apt_931_id FROM apartments WHERE serial_number = 'SM239012931';
    SELECT id INTO apt_932_id FROM apartments WHERE serial_number = 'SM239012932';
    SELECT id INTO apt_933_id FROM apartments WHERE serial_number = 'SM239012933';
    SELECT id INTO apt_934_id FROM apartments WHERE serial_number = 'SM239012934';
    SELECT id INTO apt_935_id FROM apartments WHERE serial_number = 'SM239012935';
    SELECT id INTO apt_936_id FROM apartments WHERE serial_number = 'SM239012936';
    SELECT id INTO apt_937_id FROM apartments WHERE serial_number = 'SM239012937';
    
    -- Insert devices
    INSERT INTO devices (serial_number, device_name, device_type_id, valve_status, wifi_signal, apartment_id, status, firmware_version, hardware_version) VALUES
    ('SM239012930', 'New Device 019201290', water_meter_type_id, 'closed', 'good', apt_930_id, 'active', 'v2.1.3', 'v1.0'),
    ('SM239012931', 'Device PAR-001', water_meter_type_id, 'open', 'excellent', apt_931_id, 'active', 'v2.1.3', 'v1.0'),
    ('SM239012932', 'Device PAR-002', water_meter_type_id, 'closed', 'good', apt_932_id, 'active', 'v2.1.2', 'v1.0'),
    ('SM239012933', 'Device PAR-003', water_meter_type_id, 'open', 'fair', apt_933_id, 'active', 'v2.1.3', 'v1.0'),
    ('SM239012934', 'Device PAR-004', water_meter_type_id, 'closed', 'excellent', apt_934_id, 'active', 'v2.1.3', 'v1.0'),
    ('SM239012935', 'Device PAR-005', water_meter_type_id, 'open', 'good', apt_935_id, 'active', 'v2.1.2', 'v1.0'),
    ('SM239012936', 'Device PAR-006', water_meter_type_id, 'closed', 'poor', apt_936_id, 'offline', 'v2.1.1', 'v1.0'),
    ('SM239012937', 'Device PAR-007', water_meter_type_id, 'open', 'excellent', apt_937_id, 'active', 'v2.1.3', 'v1.0'),
    ('SM2331230901', 'Unassigned Device 001', water_meter_type_id, 'closed', 'good', NULL, 'inactive', 'v2.1.2', 'v1.0'),
    ('SM2331230984', 'Unassigned Device 002', water_meter_type_id, 'closed', 'excellent', NULL, 'inactive', 'v2.1.3', 'v1.0');
END $$;

-- =====================================================
-- ALARM TYPES DATA
-- =====================================================
INSERT INTO alarm_types (alarm_code, alarm_name, severity, color_code, requires_action) VALUES
('major_leak', 'Major Leak', 'critical', '#FF0000', true),
('medium_leak', 'Medium Leak', 'high', '#FFA500', true),
('micro_leak', 'Micro Leak', 'medium', '#FFFF00', false),
('low_temp', 'Low Temperature', 'high', '#00BFFF', true),
('wifi_lost', 'Wifi Connection Lost', 'medium', '#808080', false),
('power_loss', 'Power Loss', 'high', '#800080', true),
('valve_failure', 'Valve Failure', 'critical', '#FF0000', true);

-- =====================================================
-- ALARMS DATA (Based on UI)
-- =====================================================
INSERT INTO alarms (serial_number, alarm_type_id, actual_alarm, alarm_date, alarm_type, message, action_taken, status, estimated_water_loss_m3, water_saved_m3)
SELECT 
    serial_number,
    at.id,
    actual_alarm,
    alarm_date::date,
    alarm_type,
    message,
    action_taken,
    status,
    estimated_water_loss_m3,
    water_saved_m3
FROM (VALUES
    ('SM239012930', 'major_leak', 'Major Leak', '2025-01-15', 'Major Leak', 'poss. Pipe break', 'auto shut off', 'active', 5.2, 12.8),
    ('SM239012930', 'low_temp', 'Low Temperature', '2025-01-15', 'Low Temperature', 'Ice warning', 'None', 'active', 0, 0),
    ('SM239012931', 'medium_leak', 'Medium Leak', '2025-01-15', 'Medium Leak', 'poss. Tap / Toilet', 'None', 'active', 1.8, 0),
    ('SM239012932', 'micro_leak', 'Micro Leak', '2025-01-15', 'Micro Leak', 'poss. Toilet', 'None', 'active', 0.3, 0),
    ('SM239012933', 'micro_leak', 'Micro Leak', '2025-01-15', 'Micro Leak', 'poss. Toilet', 'None', 'active', 0.2, 0),
    ('SM239012934', 'micro_leak', 'Micro Leak', '2025-01-15', 'Micro Leak', 'poss. Tap', 'None', 'active', 0.1, 0),
    ('SM239012935', 'micro_leak', 'Micro Leak', '2025-01-15', 'Micro Leak', 'poss. Tap', 'None', 'active', 0.15, 0),
    ('SM239012936', 'wifi_lost', 'Wifi Connection Lost', '2025-01-15', 'Wifi Connection Lost', 'Poor connection', 'None', 'active', 0, 0),
    ('SM239012937', 'micro_leak', 'Micro Leak', '2025-01-15', 'Micro Leak', 'poss. Tap', 'None', 'active', 0.05, 0),
    ('SM239012930', 'micro_leak', 'Micro Leak', '2025-01-15', 'Micro Leak', 'poss. Toilet', 'None', 'active', 0.08, 0)
) AS v(serial_number, alarm_code, actual_alarm, alarm_date, alarm_type, message, action_taken, status, estimated_water_loss_m3, water_saved_m3)
JOIN alarm_types at ON at.alarm_code = v.alarm_code;

-- =====================================================
-- USERS DATA
-- =====================================================
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active) VALUES
('admin', 'admin@smawatec.com', crypt('admin123', gen_salt('bf')), 'System', 'Administrator', 'admin', true),
('operator', 'operator@smawatec.com', crypt('operator123', gen_salt('bf')), 'John', 'Operator', 'operator', true),
('viewer', 'viewer@smawatec.com', crypt('viewer123', gen_salt('bf')), 'Jane', 'Viewer', 'viewer', true);

-- =====================================================
-- USER PERMISSIONS DATA
-- =====================================================
INSERT INTO user_permissions (user_id, permission, granted)
SELECT u.id, permission, true
FROM users u
CROSS JOIN (VALUES
    ('view_alarms'),
    ('manage_devices'),
    ('export_data'),
    ('manage_tenants'),
    ('manage_buildings')
) AS p(permission)
WHERE u.username = 'admin'
UNION ALL
SELECT u.id, permission, true
FROM users u
CROSS JOIN (VALUES
    ('view_alarms'),
    ('manage_devices'),
    ('export_data')
) AS p(permission)
WHERE u.username = 'operator'
UNION ALL
SELECT u.id, permission, true
FROM users u
CROSS JOIN (VALUES
    ('view_alarms')
) AS p(permission)
WHERE u.username = 'viewer';

-- =====================================================
-- SYSTEM SETTINGS DATA
-- =====================================================
INSERT INTO system_settings (setting_key, setting_value, data_type, description, updated_by_user_id)
SELECT 
    setting_key,
    setting_value,
    data_type,
    description,
    u.id
FROM (VALUES
    ('app_name', 'SMAWATEC Water Management', 'string', 'Application name'),
    ('default_water_price', '2.32', 'number', 'Default water price per m3'),
    ('alarm_check_interval', '300', 'number', 'Alarm check interval in seconds'),
    ('max_consumption_alert', '1000', 'number', 'Maximum daily consumption alert in liters'),
    ('timezone', 'Europe/Paris', 'string', 'System timezone')
) AS v(setting_key, setting_value, data_type, description)
CROSS JOIN users u
WHERE u.username = 'admin';

-- =====================================================
-- DEVICE STATUS DATA
-- =====================================================
INSERT INTO device_status (serial_number, status, last_seen, wifi_strength, battery_level, device_health)
SELECT 
    serial_number,
    status,
    last_seen,
    wifi_strength,
    battery_level,
    device_health::jsonb
FROM (VALUES
    ('SM239012930', 'online', NOW() - INTERVAL '5 minutes', 'good', '85%', '{"temperature": 22.5, "humidity": 45, "pressure": 1.2}'),
    ('SM239012931', 'online', NOW() - INTERVAL '2 minutes', 'excellent', '92%', '{"temperature": 21.8, "humidity": 42, "pressure": 1.1}'),
    ('SM239012932', 'online', NOW() - INTERVAL '8 minutes', 'good', '78%', '{"temperature": 23.1, "humidity": 48, "pressure": 1.3}'),
    ('SM239012933', 'online', NOW() - INTERVAL '12 minutes', 'fair', '65%', '{"temperature": 24.2, "humidity": 52, "pressure": 1.0}'),
    ('SM239012934', 'online', NOW() - INTERVAL '3 minutes', 'excellent', '88%', '{"temperature": 22.0, "humidity": 40, "pressure": 1.2}'),
    ('SM239012935', 'online', NOW() - INTERVAL '6 minutes', 'good', '82%', '{"temperature": 21.5, "humidity": 44, "pressure": 1.1}'),
    ('SM239012936', 'offline', NOW() - INTERVAL '2 hours', 'poor', '15%', '{"temperature": 25.8, "humidity": 60, "pressure": 0.8}'),
    ('SM239012937', 'online', NOW() - INTERVAL '1 minute', 'excellent', '95%', '{"temperature": 21.2, "humidity": 38, "pressure": 1.3}')
) AS v(serial_number, status, last_seen, wifi_strength, battery_level, device_health);

-- =====================================================
-- DAILY CONSUMPTION DATA (Last 30 days for sample devices)
-- =====================================================
INSERT INTO daily_consumption (serial_number, consumption_date, consumption_liters, consumption_m3, is_manual_entry, entered_by_user_id)
SELECT 
    serial_number,
    CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 29),
    ROUND((RANDOM() * 200 + 50)::numeric, 2),
    ROUND((RANDOM() * 0.2 + 0.05)::numeric, 4),
    true,
    (SELECT id FROM users WHERE username = 'operator')
FROM (VALUES
    ('SM239012930'),
    ('SM239012931'),
    ('SM239012932'),
    ('SM239012933'),
    ('SM239012934'),
    ('SM239012935'),
    ('SM239012936'),
    ('SM239012937')
) AS devices(serial_number);

-- =====================================================
-- NOTIFICATIONS DATA
-- =====================================================
INSERT INTO notifications (user_id, type, title, message, is_read)
SELECT 
    u.id,
    type,
    title,
    message,
    is_read
FROM (VALUES
    ('admin', 'alarm', 'Major Leak Detected', 'Device SM239012930 has detected a major leak in apartment Block 1, L23, Apt 12', false),
    ('admin', 'system', 'Device Offline', 'Device SM239012936 has been offline for more than 1 hour', false),
    ('operator', 'alarm', 'Low Temperature Warning', 'Device SM239012930 reports low temperature - possible ice formation', true),
    ('operator', 'maintenance', 'Maintenance Due', 'Device SM239012931 is due for monthly maintenance', false)
) AS v(username, type, title, message, is_read)
JOIN users u ON u.username = v.username;

-- =====================================================
-- UPDATE STATISTICS
-- =====================================================
ANALYZE;

SELECT 'Sample data inserted successfully!' as status;
