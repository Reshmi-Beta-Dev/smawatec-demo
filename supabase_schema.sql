-- =====================================================
-- SMAWATEC Water Management System - Supabase Database
-- Complete Schema with Sample Data
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE BUSINESS TABLES
-- =====================================================

-- Building Groups Table
CREATE TABLE building_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cities Table
CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    country_code VARCHAR(3) DEFAULT 'FR',
    region VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Buildings Table
CREATE TABLE buildings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_name VARCHAR(100) NOT NULL,
    street_number VARCHAR(100),
    additional_address VARCHAR(200),
    zip_code VARCHAR(10),
    city VARCHAR(100),
    building_group_id UUID REFERENCES building_groups(id) ON DELETE CASCADE,
    city_id UUID REFERENCES cities(id) ON DELETE SET NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenants Table
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    salutation VARCHAR(10),
    surname VARCHAR(100) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    mobile VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    water_price_per_m3 DECIMAL(10, 4) DEFAULT 2.32,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Apartments Table
CREATE TABLE apartments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID REFERENCES buildings(id) ON DELETE CASCADE,
    apartment_name VARCHAR(100) NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE SET NULL,
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    block VARCHAR(20),
    level VARCHAR(20),
    apartment_number VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Device Types Table
CREATE TABLE device_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    manufacturer VARCHAR(100),
    model VARCHAR(100),
    specifications JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Devices Table
CREATE TABLE devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number VARCHAR(50) UNIQUE NOT NULL,
    device_name VARCHAR(100) NOT NULL,
    device_type_id UUID REFERENCES device_types(id) ON DELETE SET NULL,
    valve_status VARCHAR(20) DEFAULT 'closed',
    wifi_signal VARCHAR(20) DEFAULT 'good',
    apartment_id UUID REFERENCES apartments(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active',
    firmware_version VARCHAR(20),
    hardware_version VARCHAR(20),
    last_seen TIMESTAMP WITH TIME ZONE,
    installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alarm Types Table
CREATE TABLE alarm_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alarm_code VARCHAR(50) UNIQUE NOT NULL,
    alarm_name VARCHAR(100) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    color_code VARCHAR(7),
    requires_action BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alarms Table
CREATE TABLE alarms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number VARCHAR(50) REFERENCES devices(serial_number) ON DELETE CASCADE,
    alarm_type_id UUID REFERENCES alarm_types(id) ON DELETE SET NULL,
    actual_alarm VARCHAR(100),
    alarm_date DATE NOT NULL,
    alarm_type VARCHAR(100),
    message TEXT,
    action_taken VARCHAR(100) DEFAULT 'None',
    status VARCHAR(20) DEFAULT 'active',
    estimated_water_loss_m3 DECIMAL(10, 4) DEFAULT 0,
    water_saved_m3 DECIMAL(10, 4) DEFAULT 0,
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    hidden_at TIMESTAMP WITH TIME ZONE,
    resolved_by_user_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily Consumption Table
CREATE TABLE daily_consumption (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number VARCHAR(50) REFERENCES devices(serial_number) ON DELETE CASCADE,
    consumption_date DATE NOT NULL,
    consumption_liters DECIMAL(10, 2) NOT NULL,
    consumption_m3 DECIMAL(10, 4) NOT NULL,
    is_manual_entry BOOLEAN DEFAULT true,
    entered_by_user_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(serial_number, consumption_date)
);

-- =====================================================
-- USER MANAGEMENT TABLES
-- =====================================================

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- User Permissions Table
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(50) NOT NULL,
    granted BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, permission)
);

-- =====================================================
-- SYSTEM TABLES
-- =====================================================

-- System Settings Table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    data_type VARCHAR(20) DEFAULT 'string',
    description TEXT,
    updated_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Device Status Table
CREATE TABLE device_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number VARCHAR(50) REFERENCES devices(serial_number) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'online',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    wifi_strength VARCHAR(20),
    battery_level VARCHAR(20),
    device_health JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Building indexes
CREATE INDEX idx_buildings_group_id ON buildings(building_group_id);
CREATE INDEX idx_buildings_city_id ON buildings(city_id);
CREATE INDEX idx_buildings_zip_code ON buildings(zip_code);

-- Apartment indexes
CREATE INDEX idx_apartments_building_id ON apartments(building_id);
CREATE INDEX idx_apartments_tenant_id ON apartments(tenant_id);
CREATE INDEX idx_apartments_serial_number ON apartments(serial_number);

-- Device indexes
CREATE INDEX idx_devices_apartment_id ON devices(apartment_id);
CREATE INDEX idx_devices_serial_number ON devices(serial_number);
CREATE INDEX idx_devices_status ON devices(status);

-- Alarm indexes
CREATE INDEX idx_alarms_serial_number ON alarms(serial_number);
CREATE INDEX idx_alarms_date ON alarms(alarm_date);
CREATE INDEX idx_alarms_status ON alarms(status);
CREATE INDEX idx_alarms_type ON alarms(alarm_type);

-- Consumption indexes
CREATE INDEX idx_consumption_serial_number ON daily_consumption(serial_number);
CREATE INDEX idx_consumption_date ON daily_consumption(consumption_date);
CREATE INDEX idx_consumption_serial_date ON daily_consumption(serial_number, consumption_date);

-- User indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_building_groups_updated_at BEFORE UPDATE ON building_groups FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON buildings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_apartments_updated_at BEFORE UPDATE ON apartments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alarms_updated_at BEFORE UPDATE ON alarms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_daily_consumption_updated_at BEFORE UPDATE ON daily_consumption FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_device_status_updated_at BEFORE UPDATE ON device_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE building_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE alarms ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on requirements)
CREATE POLICY "Enable read access for all users" ON building_groups FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON buildings FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON tenants FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON apartments FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON devices FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON alarms FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON daily_consumption FOR SELECT USING (true);

-- Admin policies for write access
CREATE POLICY "Enable all access for admin users" ON building_groups FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Enable all access for admin users" ON buildings FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Enable all access for admin users" ON tenants FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Enable all access for admin users" ON apartments FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Enable all access for admin users" ON devices FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Enable all access for admin users" ON alarms FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

CREATE POLICY "Enable all access for admin users" ON daily_consumption FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin')
);

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- Building with apartment count view
CREATE VIEW building_apartment_summary AS
SELECT 
    b.id,
    b.building_name,
    b.street_number,
    b.additional_address,
    b.zip_code,
    b.city,
    bg.group_name,
    COUNT(a.id) as apartment_count,
    COUNT(d.id) as device_count
FROM buildings b
LEFT JOIN building_groups bg ON b.building_group_id = bg.id
LEFT JOIN apartments a ON b.id = a.building_id
LEFT JOIN devices d ON a.serial_number = d.serial_number
GROUP BY b.id, b.building_name, b.street_number, b.additional_address, b.zip_code, b.city, bg.group_name;

-- Alarm summary view
CREATE VIEW alarm_summary AS
SELECT 
    at.alarm_code,
    at.alarm_name,
    at.severity,
    COUNT(a.id) as total_count,
    COUNT(CASE WHEN a.status = 'active' THEN 1 END) as active_count,
    COUNT(CASE WHEN a.status = 'resolved' THEN 1 END) as resolved_count,
    COUNT(CASE WHEN a.status = 'hidden' THEN 1 END) as hidden_count
FROM alarm_types at
LEFT JOIN alarms a ON at.id = a.alarm_type_id
GROUP BY at.id, at.alarm_code, at.alarm_name, at.severity;

-- Monthly consumption view
CREATE VIEW monthly_consumption AS
SELECT 
    serial_number,
    DATE_TRUNC('month', consumption_date) as month,
    SUM(consumption_m3) as total_consumption_m3,
    SUM(consumption_liters) as total_consumption_liters,
    COUNT(*) as reading_days
FROM daily_consumption
GROUP BY serial_number, DATE_TRUNC('month', consumption_date);

-- =====================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function to get consumption for a period
CREATE OR REPLACE FUNCTION get_consumption_period(
    device_serial VARCHAR(50),
    start_date DATE,
    end_date DATE
)
RETURNS TABLE (
    consumption_date DATE,
    consumption_m3 DECIMAL(10, 4),
    consumption_liters DECIMAL(10, 2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        dc.consumption_date,
        dc.consumption_m3,
        dc.consumption_liters
    FROM daily_consumption dc
    WHERE dc.serial_number = device_serial
    AND dc.consumption_date BETWEEN start_date AND end_date
    ORDER BY dc.consumption_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get active alarms count
CREATE OR REPLACE FUNCTION get_active_alarms_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)
        FROM alarms
        WHERE status = 'active'
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get consumption statistics
CREATE OR REPLACE FUNCTION get_consumption_stats(
    device_serial VARCHAR(50),
    period_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    total_consumption_m3 DECIMAL(10, 4),
    average_daily_m3 DECIMAL(10, 4),
    max_daily_m3 DECIMAL(10, 4),
    min_daily_m3 DECIMAL(10, 4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        SUM(dc.consumption_m3) as total_consumption_m3,
        AVG(dc.consumption_m3) as average_daily_m3,
        MAX(dc.consumption_m3) as max_daily_m3,
        MIN(dc.consumption_m3) as min_daily_m3
    FROM daily_consumption dc
    WHERE dc.serial_number = device_serial
    AND dc.consumption_date >= CURRENT_DATE - INTERVAL '1 day' * period_days;
END;
$$ LANGUAGE plpgsql;
