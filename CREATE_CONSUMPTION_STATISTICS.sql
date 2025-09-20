-- Create consumption statistics function for the Home component Consumption box
-- This function provides consumption data for current and historical periods

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS get_consumption_statistics();

-- Create the consumption statistics function
CREATE OR REPLACE FUNCTION get_consumption_statistics()
RETURNS TABLE (
    current_year_total_m3 numeric,
    current_year_to_sept_m3 numeric,
    previous_year_total_m3 numeric,
    previous_year_to_sept_m3 numeric,
    year_2024_total_m3 numeric,
    year_2023_total_m3 numeric,
    year_2022_total_m3 numeric,
    current_month_m3 numeric,
    previous_month_m3 numeric,
    monthly_data jsonb
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
    WITH monthly_totals AS (
        SELECT 
            EXTRACT(YEAR FROM consumption_date) as year,
            EXTRACT(MONTH FROM consumption_date) as month,
            SUM(consumption_m3) as total_m3
        FROM consumption_data
        WHERE consumption_date >= '2022-01-01'
        GROUP BY EXTRACT(YEAR FROM consumption_date), EXTRACT(MONTH FROM consumption_date)
    ),
    yearly_totals AS (
        SELECT 
            year,
            SUM(total_m3) as yearly_total
        FROM monthly_totals
        GROUP BY year
    ),
    current_year_data AS (
        SELECT 
            COALESCE(SUM(CASE WHEN year = EXTRACT(YEAR FROM CURRENT_DATE) THEN total_m3 END), 0) as current_year_total,
            COALESCE(SUM(CASE WHEN year = EXTRACT(YEAR FROM CURRENT_DATE) AND month <= 9 THEN total_m3 END), 0) as current_year_to_sept
        FROM monthly_totals
    ),
    previous_year_data AS (
        SELECT 
            COALESCE(SUM(CASE WHEN year = EXTRACT(YEAR FROM CURRENT_DATE) - 1 THEN total_m3 END), 0) as previous_year_total,
            COALESCE(SUM(CASE WHEN year = EXTRACT(YEAR FROM CURRENT_DATE) - 1 AND month <= 9 THEN total_m3 END), 0) as previous_year_to_sept
        FROM monthly_totals
    ),
    historical_data AS (
        SELECT 
            COALESCE(SUM(CASE WHEN year = 2024 THEN yearly_total END), 0) as year_2024,
            COALESCE(SUM(CASE WHEN year = 2023 THEN yearly_total END), 0) as year_2023,
            COALESCE(SUM(CASE WHEN year = 2022 THEN yearly_total END), 0) as year_2022
        FROM yearly_totals
    ),
    current_month_data AS (
        SELECT 
            COALESCE(SUM(CASE 
                WHEN year = EXTRACT(YEAR FROM CURRENT_DATE) 
                AND month = EXTRACT(MONTH FROM CURRENT_DATE) 
                THEN total_m3 
            END), 0) as current_month,
            COALESCE(SUM(CASE 
                WHEN year = EXTRACT(YEAR FROM CURRENT_DATE) 
                AND month = EXTRACT(MONTH FROM CURRENT_DATE) - 1 
                THEN total_m3 
            END), 0) as previous_month
        FROM monthly_totals
    ),
    monthly_chart_data AS (
        SELECT 
            jsonb_agg(
                jsonb_build_object(
                    'month', month,
                    'total_m3', total_m3
                ) ORDER BY month
            ) as monthly_data
        FROM monthly_totals
        WHERE year = EXTRACT(YEAR FROM CURRENT_DATE)
    )
    SELECT 
        cyd.current_year_total as current_year_total_m3,
        cyd.current_year_to_sept as current_year_to_sept_m3,
        pyd.previous_year_total as previous_year_total_m3,
        pyd.previous_year_to_sept as previous_year_to_sept_m3,
        hd.year_2024 as year_2024_total_m3,
        hd.year_2023 as year_2023_total_m3,
        hd.year_2022 as year_2022_total_m3,
        cmd.current_month as current_month_m3,
        cmd.previous_month as previous_month_m3,
        mcd.monthly_data
    FROM current_year_data cyd
    CROSS JOIN previous_year_data pyd
    CROSS JOIN historical_data hd
    CROSS JOIN current_month_data cmd
    CROSS JOIN monthly_chart_data mcd;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_consumption_statistics() TO anon;
GRANT EXECUTE ON FUNCTION get_consumption_statistics() TO authenticated;

-- Test the function
SELECT 'Consumption statistics function created successfully. Testing...' as status;
SELECT * FROM get_consumption_statistics();
