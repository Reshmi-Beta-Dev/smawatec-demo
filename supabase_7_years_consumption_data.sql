-- =====================================================
-- SMAWATEC 7 Years Historical Consumption Data
-- Generates realistic consumption data for the last 7 years
-- =====================================================

-- Clear existing consumption data (optional - comment out if you want to keep current data)
-- DELETE FROM daily_consumption;

-- =====================================================
-- 7 YEARS CONSUMPTION DATA GENERATION
-- =====================================================

-- Function to generate realistic consumption patterns
CREATE OR REPLACE FUNCTION generate_consumption_data(
    device_serial VARCHAR(50),
    start_date DATE,
    end_date DATE,
    base_consumption_liters DECIMAL DEFAULT 100,
    variation_percent DECIMAL DEFAULT 50
)
RETURNS VOID AS $$
DECLARE
    loop_date DATE;
    daily_consumption DECIMAL;
    seasonal_factor DECIMAL;
    day_of_week_factor DECIMAL;
    random_factor DECIMAL;
    final_consumption_liters DECIMAL;
    final_consumption_m3 DECIMAL;
BEGIN
    loop_date := start_date;
    
    WHILE loop_date <= end_date LOOP
        -- Seasonal variation (higher in summer, lower in winter)
        seasonal_factor := 1.0 + 0.3 * SIN(2 * PI() * EXTRACT(DOY FROM loop_date) / 365.25 - PI()/2);
        
        -- Day of week variation (higher on weekends)
        day_of_week_factor := CASE EXTRACT(DOW FROM loop_date)
            WHEN 0 THEN 1.2  -- Sunday
            WHEN 6 THEN 1.1  -- Saturday
            ELSE 1.0         -- Weekdays
        END;
        
        -- Random variation (-variation_percent to +variation_percent)
        random_factor := 1.0 + (RANDOM() - 0.5) * variation_percent / 100;
        
        -- Calculate final consumption
        daily_consumption := base_consumption_liters * seasonal_factor * day_of_week_factor * random_factor;
        
        -- Ensure minimum consumption
        daily_consumption := GREATEST(daily_consumption, 10);
        
        -- Round to 2 decimal places
        final_consumption_liters := ROUND(daily_consumption, 2);
        final_consumption_m3 := ROUND(final_consumption_liters / 1000, 4);
        
        -- Insert consumption record
        INSERT INTO daily_consumption (
            serial_number,
            consumption_date,
            consumption_liters,
            consumption_m3,
            is_manual_entry,
            entered_by_user_id,
            created_at
        ) VALUES (
            device_serial,
            loop_date,
            final_consumption_liters,
            final_consumption_m3,
            true,
            (SELECT id FROM users WHERE username = 'operator' LIMIT 1), -- Operator user
            NOW()
        ) ON CONFLICT (serial_number, consumption_date) DO UPDATE SET
            consumption_liters = EXCLUDED.consumption_liters,
            consumption_m3 = EXCLUDED.consumption_m3,
            updated_at = NOW();
        
        loop_date := loop_date + INTERVAL '1 day';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GENERATE 7 YEARS OF DATA FOR ALL DEVICES
-- =====================================================

-- Generate data for each device with different consumption patterns
-- Device 1: SM239012930 - High consumption apartment
SELECT generate_consumption_data(
    'SM239012930',
    (CURRENT_DATE - INTERVAL '7 years')::DATE,
    CURRENT_DATE::DATE,
    150,  -- Base consumption: 150 liters/day
    40    -- Variation: ±40%
);

-- Device 2: SM239012931 - Medium consumption apartment
SELECT generate_consumption_data(
    'SM239012931',
    (CURRENT_DATE - INTERVAL '7 years')::DATE,
    CURRENT_DATE::DATE,
    120,  -- Base consumption: 120 liters/day
    35    -- Variation: ±35%
);

-- Device 3: SM239012932 - High consumption apartment
SELECT generate_consumption_data(
    'SM239012932',
    (CURRENT_DATE - INTERVAL '7 years')::DATE,
    CURRENT_DATE::DATE,
    180,  -- Base consumption: 180 liters/day
    45    -- Variation: ±45%
);

-- Device 4: SM239012933 - Low consumption apartment
SELECT generate_consumption_data(
    'SM239012933',
    (CURRENT_DATE - INTERVAL '7 years')::DATE,
    CURRENT_DATE::DATE,
    80,   -- Base consumption: 80 liters/day
    30    -- Variation: ±30%
);

-- Device 5: SM239012934 - Medium-high consumption apartment
SELECT generate_consumption_data(
    'SM239012934',
    (CURRENT_DATE - INTERVAL '7 years')::DATE,
    CURRENT_DATE::DATE,
    140,  -- Base consumption: 140 liters/day
    40    -- Variation: ±40%
);

-- Device 6: SM239012935 - Low consumption apartment
SELECT generate_consumption_data(
    'SM239012935',
    (CURRENT_DATE - INTERVAL '7 years')::DATE,
    CURRENT_DATE::DATE,
    90,   -- Base consumption: 90 liters/day
    25    -- Variation: ±25%
);

-- Device 7: SM239012936 - Medium consumption apartment (with some offline periods)
SELECT generate_consumption_data(
    'SM239012936',
    (CURRENT_DATE - INTERVAL '7 years')::DATE,
    CURRENT_DATE::DATE,
    110,  -- Base consumption: 110 liters/day
    50    -- Variation: ±50% (higher variation due to connectivity issues)
);

-- Device 8: SM239012937 - High consumption apartment
SELECT generate_consumption_data(
    'SM239012937',
    (CURRENT_DATE - INTERVAL '7 years')::DATE,
    CURRENT_DATE::DATE,
    160,  -- Base consumption: 160 liters/day
    35    -- Variation: ±35%
);

-- =====================================================
-- ADD SPECIAL EVENTS AND ANOMALIES
-- =====================================================

-- Add some major leak events (sudden spikes in consumption)
UPDATE daily_consumption 
SET 
    consumption_liters = consumption_liters * 3.5,
    consumption_m3 = consumption_m3 * 3.5,
    notes = 'Major leak detected - consumption spike'
WHERE serial_number = 'SM239012930' 
AND consumption_date IN (
    '2022-03-15', '2022-08-22', '2023-01-10', '2023-06-05', '2024-02-28'
);

-- Add some vacation periods (very low consumption)
UPDATE daily_consumption 
SET 
    consumption_liters = 15 + RANDOM() * 10,
    consumption_m3 = (15 + RANDOM() * 10) / 1000,
    notes = 'Vacation period - minimal consumption'
WHERE serial_number = 'SM239012931' 
AND consumption_date BETWEEN '2022-07-01' AND '2022-07-15'
OR consumption_date BETWEEN '2023-12-20' AND '2024-01-05';

-- Add some maintenance periods (zero consumption)
UPDATE daily_consumption 
SET 
    consumption_liters = 0,
    consumption_m3 = 0,
    notes = 'Maintenance period - water shut off'
WHERE serial_number = 'SM239012932' 
AND consumption_date IN (
    '2021-11-05', '2022-05-12', '2023-09-18'
);

-- =====================================================
-- CREATE AGGREGATED VIEWS FOR PERFORMANCE
-- NOTE: These views are created after data generation
-- =====================================================

-- Views moved to end of script after data generation

-- =====================================================
-- CREATE PERFORMANCE FUNCTIONS
-- =====================================================

-- Function to get consumption trends
CREATE OR REPLACE FUNCTION get_consumption_trend(
    device_serial VARCHAR(50),
    period_months INTEGER DEFAULT 12
)
RETURNS TABLE (
    month DATE,
    consumption_m3 DECIMAL(10, 4),
    consumption_liters DECIMAL(10, 2),
    trend_direction TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH monthly_data AS (
        SELECT 
            DATE_TRUNC('month', consumption_date) as month,
            SUM(consumption_m3) as consumption_m3,
            SUM(consumption_liters) as consumption_liters
        FROM daily_consumption
        WHERE serial_number = device_serial
        AND consumption_date >= CURRENT_DATE - INTERVAL '1 month' * period_months
        GROUP BY DATE_TRUNC('month', consumption_date)
        ORDER BY month
    ),
    trend_data AS (
        SELECT 
            month,
            consumption_m3,
            consumption_liters,
            CASE 
                WHEN LAG(consumption_m3) OVER (ORDER BY month) IS NULL THEN 'baseline'
                WHEN consumption_m3 > LAG(consumption_m3) OVER (ORDER BY month) * 1.05 THEN 'increasing'
                WHEN consumption_m3 < LAG(consumption_m3) OVER (ORDER BY month) * 0.95 THEN 'decreasing'
                ELSE 'stable'
            END as trend_direction
        FROM monthly_data
    )
    SELECT * FROM trend_data;
END;
$$ LANGUAGE plpgsql;

-- Function to get consumption statistics for any period
CREATE OR REPLACE FUNCTION get_consumption_statistics(
    device_serial VARCHAR(50),
    start_date DATE,
    end_date DATE
)
RETURNS TABLE (
    total_consumption_m3 DECIMAL(10, 4),
    total_consumption_liters DECIMAL(10, 2),
    avg_daily_m3 DECIMAL(10, 4),
    max_daily_m3 DECIMAL(10, 4),
    min_daily_m3 DECIMAL(10, 4),
    total_days INTEGER,
    consumption_per_day DECIMAL(10, 4)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        SUM(dc.consumption_m3) as total_consumption_m3,
        SUM(dc.consumption_liters) as total_consumption_liters,
        AVG(dc.consumption_m3) as avg_daily_m3,
        MAX(dc.consumption_m3) as max_daily_m3,
        MIN(dc.consumption_m3) as min_daily_m3,
        COUNT(*) as total_days,
        SUM(dc.consumption_m3) / GREATEST(COUNT(*), 1) as consumption_per_day
    FROM daily_consumption dc
    WHERE dc.serial_number = device_serial
    AND dc.consumption_date BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- UPDATE STATISTICS AND CLEANUP
-- =====================================================

-- Update table statistics for better query performance
ANALYZE daily_consumption;

-- Clean up the temporary function
DROP FUNCTION generate_consumption_data(VARCHAR, DATE, DATE, DECIMAL, DECIMAL);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Show data range and counts
SELECT 
    'Data Range' as info,
    MIN(consumption_date) as start_date,
    MAX(consumption_date) as end_date,
    COUNT(*) as total_records,
    COUNT(DISTINCT serial_number) as unique_devices
FROM daily_consumption;

-- Show consumption by year
SELECT 
    EXTRACT(YEAR FROM consumption_date) as year,
    COUNT(*) as total_readings,
    SUM(consumption_m3) as total_consumption_m3,
    AVG(consumption_m3) as avg_daily_consumption_m3
FROM daily_consumption
GROUP BY EXTRACT(YEAR FROM consumption_date)
ORDER BY year;

-- Show consumption by device for current year
SELECT 
    serial_number,
    COUNT(*) as readings_this_year,
    SUM(consumption_m3) as total_consumption_m3,
    AVG(consumption_m3) as avg_daily_consumption_m3
FROM daily_consumption
WHERE EXTRACT(YEAR FROM consumption_date) = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY serial_number
ORDER BY total_consumption_m3 DESC;

-- =====================================================
-- CREATE AGGREGATED VIEWS FOR PERFORMANCE (AFTER DATA GENERATION)
-- =====================================================

-- Monthly consumption summary view
CREATE OR REPLACE VIEW monthly_consumption_summary AS
SELECT 
    serial_number,
    DATE_TRUNC('month', consumption_date) as month,
    EXTRACT(YEAR FROM DATE_TRUNC('month', consumption_date)) as year,
    EXTRACT(MONTH FROM DATE_TRUNC('month', consumption_date)) as month_number,
    SUM(consumption_m3) as total_consumption_m3,
    SUM(consumption_liters) as total_consumption_liters,
    AVG(consumption_m3) as avg_daily_consumption_m3,
    MAX(consumption_m3) as max_daily_consumption_m3,
    MIN(consumption_m3) as min_daily_consumption_m3,
    COUNT(*) as reading_days
FROM daily_consumption
GROUP BY serial_number, DATE_TRUNC('month', consumption_date)
ORDER BY serial_number, month;

-- Yearly consumption summary view
CREATE OR REPLACE VIEW yearly_consumption_summary AS
SELECT 
    serial_number,
    EXTRACT(YEAR FROM consumption_date) as year,
    SUM(consumption_m3) as total_consumption_m3,
    SUM(consumption_liters) as total_consumption_liters,
    AVG(consumption_m3) as avg_daily_consumption_m3,
    MAX(consumption_m3) as max_daily_consumption_m3,
    MIN(consumption_m3) as min_daily_consumption_m3,
    COUNT(*) as reading_days
FROM daily_consumption
GROUP BY serial_number, EXTRACT(YEAR FROM consumption_date)
ORDER BY serial_number, year;

-- Building consumption summary view
CREATE OR REPLACE VIEW building_consumption_summary AS
SELECT 
    b.id as building_id,
    b.building_name,
    bg.group_name,
    DATE_TRUNC('month', dc.consumption_date) as month,
    SUM(dc.consumption_m3) as total_consumption_m3,
    SUM(dc.consumption_liters) as total_consumption_liters,
    COUNT(DISTINCT dc.serial_number) as active_devices,
    COUNT(dc.id) as total_readings
FROM buildings b
JOIN building_groups bg ON b.building_group_id = bg.id
JOIN apartments a ON b.id = a.building_id
JOIN daily_consumption dc ON a.serial_number = dc.serial_number
GROUP BY b.id, b.building_name, bg.group_name, DATE_TRUNC('month', dc.consumption_date)
ORDER BY b.building_name, month;

SELECT '7 years of consumption data generated successfully!' as status;
