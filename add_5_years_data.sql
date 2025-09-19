-- Add 5 years of consumption data for all devices
-- This script will generate realistic consumption data for the past 5 years

DO $$
DECLARE
    device_record RECORD;
    current_date DATE;
    loop_date DATE;
    consumption_value DECIMAL(10,2);
    base_consumption DECIMAL(10,2);
    seasonal_factor DECIMAL(10,2);
    random_factor DECIMAL(10,2);
    day_of_year INTEGER;
    year_offset INTEGER;
BEGIN
    -- Get all devices
    FOR device_record IN 
        SELECT serial_number FROM devices 
    LOOP
        RAISE NOTICE 'Processing device: %', device_record.serial_number;
        
        -- Generate data for each of the past 5 years
        FOR year_offset IN 0..4 LOOP
            current_date := CURRENT_DATE - (year_offset || ' years')::INTERVAL;
            
            -- Start from January 1st of that year
            loop_date := DATE_TRUNC('year', current_date)::DATE;
            
            -- Generate data for the entire year
            WHILE loop_date <= LEAST(CURRENT_DATE, DATE_TRUNC('year', current_date)::DATE + INTERVAL '1 year' - INTERVAL '1 day') LOOP
                -- Base consumption varies by device type and season
                base_consumption := 50 + (EXTRACT(DAY FROM loop_date) % 30) * 2;
                
                -- Seasonal factor (higher in summer, lower in winter)
                day_of_year := EXTRACT(DOY FROM loop_date);
                seasonal_factor := 0.8 + 0.4 * SIN(2 * PI() * (day_of_year - 80) / 365.0);
                
                -- Random factor for daily variation
                random_factor := 0.7 + 0.6 * RANDOM();
                
                -- Calculate final consumption
                consumption_value := base_consumption * seasonal_factor * random_factor;
                
                -- Add some weekend variation (lower consumption on weekends)
                IF EXTRACT(DOW FROM loop_date) IN (0, 6) THEN
                    consumption_value := consumption_value * 0.8;
                END IF;
                
                -- Add some holiday variation (lower consumption on holidays)
                IF (EXTRACT(MONTH FROM loop_date) = 12 AND EXTRACT(DAY FROM loop_date) BETWEEN 24 AND 26) OR
                   (EXTRACT(MONTH FROM loop_date) = 1 AND EXTRACT(DAY FROM loop_date) = 1) OR
                   (EXTRACT(MONTH FROM loop_date) = 7 AND EXTRACT(DAY FROM loop_date) = 4) THEN
                    consumption_value := consumption_value * 0.6;
                END IF;
                
                -- Insert the consumption data
                INSERT INTO daily_consumption (
                    id,
                    serial_number,
                    consumption_date,
                    consumption_liters,
                    created_at,
                    updated_at
                ) VALUES (
                    uuid_generate_v4(),
                    device_record.serial_number,
                    loop_date,
                    ROUND(consumption_value, 2),
                    NOW(),
                    NOW()
                )
                ON CONFLICT (serial_number, consumption_date) DO UPDATE SET
                    consumption_liters = EXCLUDED.consumption_liters,
                    updated_at = NOW();
                
                -- Move to next day
                loop_date := loop_date + INTERVAL '1 day';
            END LOOP;
            
            RAISE NOTICE 'Completed year: %', EXTRACT(YEAR FROM current_date);
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Successfully generated 5 years of consumption data for all devices';
END $$;

-- Create a summary view to verify the data
CREATE OR REPLACE VIEW consumption_summary AS
SELECT 
    EXTRACT(YEAR FROM consumption_date) as year,
    COUNT(*) as total_records,
    SUM(consumption_liters) as total_consumption,
    AVG(consumption_liters) as avg_consumption,
    MIN(consumption_liters) as min_consumption,
    MAX(consumption_liters) as max_consumption
FROM daily_consumption 
GROUP BY EXTRACT(YEAR FROM consumption_date)
ORDER BY year;

-- Show the summary
SELECT * FROM consumption_summary;
