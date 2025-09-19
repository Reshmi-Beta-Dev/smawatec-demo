-- =====================================================
-- SMAWATEC Consumption Data Analysis Queries
-- Useful queries for analyzing the 7 years of consumption data
-- =====================================================

-- =====================================================
-- OVERVIEW QUERIES
-- =====================================================

-- 1. Overall data summary
SELECT 
    'Total Records' as metric,
    COUNT(*)::TEXT as value
FROM daily_consumption
UNION ALL
SELECT 
    'Date Range',
    MIN(consumption_date)::TEXT || ' to ' || MAX(consumption_date)::TEXT
FROM daily_consumption
UNION ALL
SELECT 
    'Unique Devices',
    COUNT(DISTINCT serial_number)::TEXT
FROM daily_consumption
UNION ALL
SELECT 
    'Total Consumption (m³)',
    ROUND(SUM(consumption_m3), 2)::TEXT
FROM daily_consumption;

-- 2. Yearly consumption trends
SELECT 
    EXTRACT(YEAR FROM consumption_date) as year,
    COUNT(*) as total_readings,
    ROUND(SUM(consumption_m3), 2) as total_consumption_m3,
    ROUND(AVG(consumption_m3), 4) as avg_daily_consumption_m3,
    ROUND(MAX(consumption_m3), 4) as max_daily_consumption_m3,
    ROUND(MIN(consumption_m3), 4) as min_daily_consumption_m3
FROM daily_consumption
GROUP BY EXTRACT(YEAR FROM consumption_date)
ORDER BY year;

-- 3. Monthly consumption for current year
SELECT 
    TO_CHAR(consumption_date, 'YYYY-MM') as month,
    COUNT(*) as readings,
    ROUND(SUM(consumption_m3), 2) as total_consumption_m3,
    ROUND(AVG(consumption_m3), 4) as avg_daily_consumption_m3
FROM daily_consumption
WHERE EXTRACT(YEAR FROM consumption_date) = EXTRACT(YEAR FROM CURRENT_DATE)
GROUP BY TO_CHAR(consumption_date, 'YYYY-MM')
ORDER BY month;

-- =====================================================
-- DEVICE-SPECIFIC ANALYSIS
-- =====================================================

-- 4. Device consumption ranking (all time)
SELECT 
    dc.serial_number,
    d.device_name,
    a.apartment_name,
    t.first_name || ' ' || t.surname as tenant_name,
    COUNT(*) as total_readings,
    ROUND(SUM(dc.consumption_m3), 2) as total_consumption_m3,
    ROUND(AVG(dc.consumption_m3), 4) as avg_daily_consumption_m3,
    ROUND(MAX(dc.consumption_m3), 4) as max_daily_consumption_m3
FROM daily_consumption dc
JOIN devices d ON dc.serial_number = d.serial_number
LEFT JOIN apartments a ON d.apartment_id = a.id
LEFT JOIN tenants t ON a.tenant_id = t.id
GROUP BY dc.serial_number, d.device_name, a.apartment_name, t.first_name, t.surname
ORDER BY total_consumption_m3 DESC;

-- 5. Device consumption trends (last 12 months)
SELECT 
    serial_number,
    TO_CHAR(consumption_date, 'YYYY-MM') as month,
    ROUND(SUM(consumption_m3), 2) as monthly_consumption_m3,
    ROUND(AVG(consumption_m3), 4) as avg_daily_consumption_m3
FROM daily_consumption
WHERE consumption_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY serial_number, TO_CHAR(consumption_date, 'YYYY-MM')
ORDER BY serial_number, month;

-- =====================================================
-- SEASONAL ANALYSIS
-- =====================================================

-- 6. Seasonal consumption patterns
SELECT 
    CASE 
        WHEN EXTRACT(MONTH FROM consumption_date) IN (12, 1, 2) THEN 'Winter'
        WHEN EXTRACT(MONTH FROM consumption_date) IN (3, 4, 5) THEN 'Spring'
        WHEN EXTRACT(MONTH FROM consumption_date) IN (6, 7, 8) THEN 'Summer'
        WHEN EXTRACT(MONTH FROM consumption_date) IN (9, 10, 11) THEN 'Autumn'
    END as season,
    COUNT(*) as readings,
    ROUND(SUM(consumption_m3), 2) as total_consumption_m3,
    ROUND(AVG(consumption_m3), 4) as avg_daily_consumption_m3
FROM daily_consumption
GROUP BY 
    CASE 
        WHEN EXTRACT(MONTH FROM consumption_date) IN (12, 1, 2) THEN 'Winter'
        WHEN EXTRACT(MONTH FROM consumption_date) IN (3, 4, 5) THEN 'Spring'
        WHEN EXTRACT(MONTH FROM consumption_date) IN (6, 7, 8) THEN 'Summer'
        WHEN EXTRACT(MONTH FROM consumption_date) IN (9, 10, 11) THEN 'Autumn'
    END
ORDER BY 
    CASE 
        WHEN EXTRACT(MONTH FROM consumption_date) IN (12, 1, 2) THEN 1
        WHEN EXTRACT(MONTH FROM consumption_date) IN (3, 4, 5) THEN 2
        WHEN EXTRACT(MONTH FROM consumption_date) IN (6, 7, 8) THEN 3
        WHEN EXTRACT(MONTH FROM consumption_date) IN (9, 10, 11) THEN 4
    END;

-- 7. Monthly average consumption by device
SELECT 
    serial_number,
    ROUND(AVG(CASE WHEN EXTRACT(MONTH FROM consumption_date) = 1 THEN consumption_m3 END), 4) as jan_avg,
    ROUND(AVG(CASE WHEN EXTRACT(MONTH FROM consumption_date) = 2 THEN consumption_m3 END), 4) as feb_avg,
    ROUND(AVG(CASE WHEN EXTRACT(MONTH FROM consumption_date) = 3 THEN consumption_m3 END), 4) as mar_avg,
    ROUND(AVG(CASE WHEN EXTRACT(MONTH FROM consumption_date) = 4 THEN consumption_m3 END), 4) as apr_avg,
    ROUND(AVG(CASE WHEN EXTRACT(MONTH FROM consumption_date) = 5 THEN consumption_m3 END), 4) as may_avg,
    ROUND(AVG(CASE WHEN EXTRACT(MONTH FROM consumption_date) = 6 THEN consumption_m3 END), 4) as jun_avg,
    ROUND(AVG(CASE WHEN EXTRACT(MONTH FROM consumption_date) = 7 THEN consumption_m3 END), 4) as jul_avg,
    ROUND(AVG(CASE WHEN EXTRACT(MONTH FROM consumption_date) = 8 THEN consumption_m3 END), 4) as aug_avg,
    ROUND(AVG(CASE WHEN EXTRACT(MONTH FROM consumption_date) = 9 THEN consumption_m3 END), 4) as sep_avg,
    ROUND(AVG(CASE WHEN EXTRACT(MONTH FROM consumption_date) = 10 THEN consumption_m3 END), 4) as oct_avg,
    ROUND(AVG(CASE WHEN EXTRACT(MONTH FROM consumption_date) = 11 THEN consumption_m3 END), 4) as nov_avg,
    ROUND(AVG(CASE WHEN EXTRACT(MONTH FROM consumption_date) = 12 THEN consumption_m3 END), 4) as dec_avg
FROM daily_consumption
GROUP BY serial_number
ORDER BY serial_number;

-- =====================================================
-- ANOMALY DETECTION
-- =====================================================

-- 8. High consumption days (anomalies)
SELECT 
    serial_number,
    consumption_date,
    consumption_m3,
    consumption_liters,
    notes
FROM daily_consumption
WHERE consumption_m3 > (
    SELECT AVG(consumption_m3) + 3 * STDDEV(consumption_m3)
    FROM daily_consumption dc2 
    WHERE dc2.serial_number = daily_consumption.serial_number
)
ORDER BY consumption_m3 DESC
LIMIT 20;

-- 9. Zero consumption days (maintenance/offline)
SELECT 
    serial_number,
    consumption_date,
    consumption_m3,
    notes
FROM daily_consumption
WHERE consumption_m3 = 0
ORDER BY serial_number, consumption_date;

-- 10. Consumption spikes (leak detection)
SELECT 
    serial_number,
    consumption_date,
    consumption_m3,
    LAG(consumption_m3) OVER (PARTITION BY serial_number ORDER BY consumption_date) as prev_day_consumption,
    ROUND(consumption_m3 / NULLIF(LAG(consumption_m3) OVER (PARTITION BY serial_number ORDER BY consumption_date), 0), 2) as consumption_ratio
FROM daily_consumption
WHERE consumption_m3 > LAG(consumption_m3) OVER (PARTITION BY serial_number ORDER BY consumption_date) * 2
ORDER BY consumption_ratio DESC
LIMIT 20;

-- =====================================================
-- BUILDING-LEVEL ANALYSIS
-- =====================================================

-- 11. Building consumption summary
SELECT 
    b.building_name,
    bg.group_name,
    COUNT(DISTINCT dc.serial_number) as device_count,
    COUNT(dc.id) as total_readings,
    ROUND(SUM(dc.consumption_m3), 2) as total_consumption_m3,
    ROUND(AVG(dc.consumption_m3), 4) as avg_daily_consumption_m3
FROM buildings b
JOIN building_groups bg ON b.building_group_id = bg.id
JOIN apartments a ON b.id = a.building_id
JOIN daily_consumption dc ON a.serial_number = dc.serial_number
GROUP BY b.id, b.building_name, bg.group_name
ORDER BY total_consumption_m3 DESC;

-- 12. Building group consumption trends (last 3 years)
SELECT 
    bg.group_name,
    EXTRACT(YEAR FROM dc.consumption_date) as year,
    COUNT(DISTINCT dc.serial_number) as device_count,
    ROUND(SUM(dc.consumption_m3), 2) as total_consumption_m3,
    ROUND(AVG(dc.consumption_m3), 4) as avg_daily_consumption_m3
FROM building_groups bg
JOIN buildings b ON bg.id = b.building_group_id
JOIN apartments a ON b.id = a.building_id
JOIN daily_consumption dc ON a.serial_number = dc.serial_number
WHERE dc.consumption_date >= CURRENT_DATE - INTERVAL '3 years'
GROUP BY bg.group_name, EXTRACT(YEAR FROM dc.consumption_date)
ORDER BY bg.group_name, year;

-- =====================================================
-- PERFORMANCE METRICS
-- =====================================================

-- 13. Water efficiency metrics
WITH device_stats AS (
    SELECT 
        serial_number,
        AVG(consumption_m3) as avg_daily_consumption,
        STDDEV(consumption_m3) as consumption_stddev,
        COUNT(*) as total_days
    FROM daily_consumption
    GROUP BY serial_number
)
SELECT 
    serial_number,
    ROUND(avg_daily_consumption, 4) as avg_daily_consumption_m3,
    ROUND(consumption_stddev, 4) as consumption_variability,
    ROUND(consumption_stddev / NULLIF(avg_daily_consumption, 0), 2) as coefficient_of_variation,
    CASE 
        WHEN consumption_stddev / NULLIF(avg_daily_consumption, 0) < 0.3 THEN 'Stable'
        WHEN consumption_stddev / NULLIF(avg_daily_consumption, 0) < 0.6 THEN 'Moderate'
        ELSE 'Variable'
    END as consumption_pattern
FROM device_stats
ORDER BY avg_daily_consumption DESC;

-- 14. Year-over-year consumption comparison
WITH yearly_consumption AS (
    SELECT 
        serial_number,
        EXTRACT(YEAR FROM consumption_date) as year,
        SUM(consumption_m3) as yearly_consumption_m3
    FROM daily_consumption
    GROUP BY serial_number, EXTRACT(YEAR FROM consumption_date)
)
SELECT 
    yc1.serial_number,
    yc1.year as current_year,
    yc1.yearly_consumption_m3,
    yc2.year as previous_year,
    yc2.yearly_consumption_m3 as previous_year_consumption,
    ROUND(
        (yc1.yearly_consumption_m3 - yc2.yearly_consumption_m3) / NULLIF(yc2.yearly_consumption_m3, 0) * 100, 
        2
    ) as year_over_year_change_percent
FROM yearly_consumption yc1
LEFT JOIN yearly_consumption yc2 ON yc1.serial_number = yc2.serial_number 
    AND yc2.year = yc1.year - 1
WHERE yc1.year >= EXTRACT(YEAR FROM CURRENT_DATE) - 1
ORDER BY yc1.serial_number, yc1.year;

-- =====================================================
-- EXPORT-READY QUERIES
-- =====================================================

-- 15. Monthly consumption for export (last 12 months)
SELECT 
    serial_number,
    TO_CHAR(consumption_date, 'YYYY-MM-DD') as date,
    consumption_liters,
    consumption_m3,
    is_manual_entry
FROM daily_consumption
WHERE consumption_date >= CURRENT_DATE - INTERVAL '12 months'
ORDER BY serial_number, consumption_date;

-- 16. Summary data for dashboard
SELECT 
    'Total Consumption (7 years)' as metric,
    ROUND(SUM(consumption_m3), 2)::TEXT || ' m³' as value
FROM daily_consumption
UNION ALL
SELECT 
    'Average Daily Consumption',
    ROUND(AVG(consumption_m3), 4)::TEXT || ' m³' as value
FROM daily_consumption
UNION ALL
SELECT 
    'Peak Daily Consumption',
    ROUND(MAX(consumption_m3), 4)::TEXT || ' m³' as value
FROM daily_consumption
UNION ALL
SELECT 
    'Data Coverage',
    ROUND(COUNT(*)::DECIMAL / (COUNT(DISTINCT serial_number) * 2555), 2)::TEXT || '%' as value
FROM daily_consumption;
