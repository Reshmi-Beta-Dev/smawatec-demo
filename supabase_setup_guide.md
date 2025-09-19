# SMAWATEC Water Management System - Supabase Setup Guide

## Overview
This guide will help you set up the complete Supabase database for the SMAWATEC Water Management System with all tables, sample data, and configurations.

## Prerequisites
- Supabase account and project
- Access to Supabase SQL Editor or pgAdmin
- Basic understanding of PostgreSQL

## Quick Setup (Recommended)

For the fastest setup, use the combined script:

1. Copy and paste the contents of `quick_setup.sql`
2. Execute the script
3. This will create the schema and insert sample data automatically

**For historical data:** After quick setup, optionally run `supabase_7_years_consumption_data.sql`

## Detailed Setup Instructions

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note down your project URL and anon key

### Step 2: Run Database Schema
1. Open Supabase SQL Editor
2. Copy and paste the contents of `supabase_schema.sql`
3. Execute the script
4. Verify all tables are created successfully

### Step 3: Insert Sample Data
**IMPORTANT:** Use the working version that avoids UUID and column reference issues:

1. Copy and paste the contents of `supabase_sample_data_simple.sql`
2. Execute the script
3. Verify data is inserted correctly

**Note:** This file uses PostgreSQL DO blocks to handle foreign key relationships properly.

### Step 3.5: Add Historical Data (Optional)
For comprehensive testing and analytics, add 7 years of historical consumption data:

1. Copy and paste the contents of `supabase_7_years_consumption_data.sql`
2. Execute the script
3. This will generate realistic consumption patterns for all devices over 7 years

**Note:** This script generates approximately 20,000+ records and may take a few minutes to complete.

### Step 4: Configure Environment Variables
Create a `.env` file in your Angular project:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 5: Install Supabase Client
```bash
npm install @supabase/supabase-js
```

## Database Structure

### Core Tables
- **building_groups**: Building group management
- **buildings**: Individual building information
- **apartments**: Apartment details with tenant assignments
- **tenants**: Tenant information and contact details
- **devices**: Water monitoring devices
- **alarms**: Alarm and alert management
- **daily_consumption**: Daily water consumption records

### Supporting Tables
- **users**: User authentication and roles
- **device_types**: Device categorization
- **alarm_types**: Alarm type definitions
- **system_settings**: Application configuration
- **notifications**: User notifications
- **device_status**: Real-time device status

## Sample Data Included

### Buildings & Apartments
- 8 building groups (PAR-GP1 to PAR-GP8)
- 8 buildings across Paris
- 8 apartments with assigned tenants
- 2 unassigned devices

### Alarms
- 10 active alarms matching UI data
- Major leaks, micro leaks, low temperature warnings
- Wifi connection issues

### Consumption Data
- 30 days of sample consumption data
- 8 devices with realistic consumption patterns
- Manual entry tracking

### Users
- Admin user: admin@smawatec.com / admin123
- Operator user: operator@smawatec.com / operator123
- Viewer user: viewer@smawatec.com / viewer123

## Key Features

### Real-time Capabilities
- Device status monitoring
- Live alarm notifications
- Consumption tracking

### Data Integrity
- Foreign key relationships
- Unique constraints
- Row Level Security (RLS)

### Performance
- Optimized indexes
- Efficient queries
- Aggregation functions

## Common Queries

### Get Building Summary
```sql
SELECT * FROM building_apartment_summary;
```

### Get Active Alarms
```sql
SELECT * FROM alarm_summary WHERE active_count > 0;
```

### Get Monthly Consumption
```sql
SELECT * FROM monthly_consumption 
WHERE month >= '2025-01-01' 
ORDER BY month DESC;
```

### Get Device Consumption for Period
```sql
SELECT * FROM get_consumption_period('SM239012930', '2025-01-01', '2025-01-31');
```

## Angular Integration

### Supabase Service Setup
```typescript
// supabase.service.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env['VITE_SUPABASE_URL']
const supabaseKey = import.meta.env['VITE_SUPABASE_ANON_KEY']

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### Example Component Usage
```typescript
// Get alarms data
const { data: alarms, error } = await supabase
  .from('alarms')
  .select(`
    *,
    devices!inner(device_name, apartment_id),
    apartments!inner(apartment_name, building_id),
    buildings!inner(building_name, street_number, additional_address, zip_code, city),
    tenants!inner(first_name, last_name)
  `)
  .eq('status', 'active')
  .order('triggered_at', { ascending: false });
```

## Security Notes

- Row Level Security (RLS) is enabled on all tables
- Basic policies are included - customize based on your requirements
- User authentication is required for write operations
- Admin users have full access to all data

## Troubleshooting

### Common Issues
1. **Permission denied**: Check RLS policies and user roles
2. **Foreign key violations**: Ensure referenced records exist
3. **Unique constraint violations**: Check for duplicate data

### Performance Tips
1. Use indexes for frequently queried columns
2. Implement pagination for large datasets
3. Use views for complex queries
4. Monitor query performance in Supabase dashboard

## Next Steps

1. Customize RLS policies for your security requirements
2. Add additional indexes based on your query patterns
3. Implement real-time subscriptions for live updates
4. Add data validation rules
5. Set up automated backups

## Support

For issues or questions:
- Check Supabase documentation
- Review PostgreSQL logs in Supabase dashboard
- Test queries in SQL Editor before implementing
