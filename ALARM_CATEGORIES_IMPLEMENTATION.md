# Alarm Categories Implementation

This document describes the implementation of dynamic alarm categories (Major Alarms, Minor Alarms, System Messages) that fetch real data from Supabase.

## Files Created/Modified

### 1. Database View (`CREATE_ALARM_CATEGORIES_VIEW.sql`)
- **Purpose**: Creates a Supabase view that categorizes alarms by severity and type
- **Features**:
  - Categorizes alarms into Major, Minor, and System categories
  - Counts different types of alarms within each category
  - Only includes active (non-resolved) alarms
  - Provides a JSON function for easy data retrieval

### 2. Service Interface (`src/app/services/supabase-alarms.service.ts`)
- **New Interfaces**:
  - `AlarmCategory`: Raw data structure from database
  - `AlarmCategories`: Structured data for Angular component
- **New Method**: `getAlarmCategories()`: Fetches alarm categories from Supabase

### 3. Angular Component (`src/app/components/alarms/alarms.component.ts`)
- **New Properties**:
  - `alarmCategories`: Stores the fetched alarm data
  - `loading`: Loading state indicator
  - `error`: Error state management
- **New Method**: `loadAlarmCategories()`: Loads data from Supabase service

### 4. Template (`src/app/components/alarms/alarms.component.html`)
- **Dynamic Data Binding**: Replaces hardcoded values with real data
- **Loading States**: Shows loading indicator while fetching data
- **Error Handling**: Displays error messages with retry functionality
- **Conditional Highlighting**: Highlights values only when they're greater than 0

### 5. Styles (`src/app/components/alarms/alarms.component.css`)
- **Loading State**: Styled loading indicator
- **Error State**: Styled error messages and retry button

## How It Works

### Data Flow
1. **Component Initialization**: `ngOnInit()` calls `loadAlarmCategories()`
2. **Service Call**: Component calls `supabaseAlarmsService.getAlarmCategories()`
3. **Database Query**: Service calls Supabase RPC function `get_alarm_categories()`
4. **Data Processing**: Service transforms raw data into structured format
5. **Template Rendering**: Angular template displays the data with proper formatting

### Alarm Categorization Logic
- **Major Alarms**: High severity alarms (leaks, shut-off issues, temperature)
- **Minor Alarms**: Medium and low severity leaks
- **System Messages**: WiFi, power, and valve-related issues

### Error Handling
- **Connection Errors**: Displays user-friendly error messages
- **Data Errors**: Falls back to default values (all zeros)
- **Retry Functionality**: Users can retry failed requests

## Usage Instructions

### 1. Database Setup
Run the SQL script in your Supabase database:
```sql
-- Execute CREATE_ALARM_CATEGORIES_VIEW.sql
```

### 2. Angular Application
The component will automatically load data when the alarms page is accessed. No additional configuration is needed.

### 3. Data Structure
The component expects the following data structure:
```typescript
{
  major: {
    major_leaks: number,
    auto_shutoff_non_resolved: number,
    low_temperature: number
  },
  minor: {
    medium_leaks: number,
    minor_leaks: number
  },
  system: {
    wifi_connection_lost: number,
    power_loss: number,
    valve_failure: number,
    poor_wifi: number
  }
}
```

## Features

### ✅ Real-time Data
- Fetches live data from Supabase database
- Updates automatically when component loads

### ✅ Error Handling
- Graceful error handling with user feedback
- Retry functionality for failed requests

### ✅ Loading States
- Visual loading indicators
- Prevents user confusion during data fetching

### ✅ Responsive Design
- Works on all screen sizes
- Mobile-friendly layout

### ✅ Type Safety
- Full TypeScript support
- Compile-time error checking

## Troubleshooting

### Common Issues
1. **No Data Displayed**: Check Supabase connection and database permissions
2. **Loading Forever**: Check network connection and Supabase service status
3. **Error Messages**: Check browser console for detailed error information

### Debug Steps
1. Check browser console for error messages
2. Verify Supabase connection in environment files
3. Test database permissions for the `get_alarm_categories()` function
4. Check if the `alarm_categories` view exists in your database

## Future Enhancements

- **Real-time Updates**: Add WebSocket support for live data updates
- **Caching**: Implement data caching to reduce database calls
- **Filtering**: Add date range and severity filters
- **Export**: Add data export functionality
- **Notifications**: Add push notifications for new alarms
