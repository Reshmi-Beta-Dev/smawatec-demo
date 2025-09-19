# Angular + Supabase Integration Setup

## 🚀 Quick Setup Instructions

### 1. Configure Supabase Environment

Update your environment files with your Supabase credentials:

**`src/environments/environment.ts`** (Development):
```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'YOUR_SUPABASE_PROJECT_URL', // Get from Supabase Dashboard
    anonKey: 'YOUR_SUPABASE_ANON_KEY' // Get from Supabase Dashboard
  }
};
```

**`src/environments/environment.prod.ts`** (Production):
```typescript
export const environment = {
  production: true,
  supabase: {
    url: 'YOUR_SUPABASE_PROJECT_URL', // Get from Supabase Dashboard
    anonKey: 'YOUR_SUPABASE_ANON_KEY' // Get from Supabase Dashboard
  }
};
```

### 2. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on "Settings" → "API"
3. Copy:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 3. Run the Database Setup

1. **First, run the schema:**
   ```sql
   \i supabase_schema.sql
   ```

2. **Then, add sample data:**
   ```sql
   \i supabase_sample_data_simple.sql
   ```

3. **Optional - Add historical data:**
   ```sql
   \i supabase_7_years_consumption_data.sql
   ```

### 4. Start Your Angular App

```bash
npm start
```

## ✅ What's Integrated

### **Home Component**
- ✅ Real-time alarm data from Supabase
- ✅ Live consumption statistics
- ✅ Dynamic monthly consumption chart
- ✅ Device status monitoring
- ✅ Loading states and error handling
- ✅ Refresh functionality

### **Supabase Service**
- ✅ Complete database integration
- ✅ Type-safe interfaces
- ✅ Real-time subscriptions
- ✅ Error handling
- ✅ Optimized queries with joins

### **Features Working**
- 📊 **Charts**: Monthly consumption with real data
- 🚨 **Alarms**: Live alarm monitoring with severity levels
- 📈 **Statistics**: Real consumption metrics
- 🔄 **Real-time**: Live data updates
- 📱 **Responsive**: Works on all devices

## 🔧 Configuration

### Environment Variables
Make sure to replace the placeholder values in your environment files:
- `YOUR_SUPABASE_PROJECT_URL`
- `YOUR_SUPABASE_ANON_KEY`

### Database Tables Used
- `alarms` - Active alarm data
- `daily_consumption` - Water consumption records
- `devices` - Device information and status
- `apartments` - Apartment and tenant details
- `buildings` - Building information
- `building_groups` - Building group management

## 🎯 Next Steps

1. **Configure your Supabase credentials**
2. **Run the database setup scripts**
3. **Start your Angular app**
4. **Test the integration**

## 🐛 Troubleshooting

### Common Issues:

1. **"Failed to load data" error**
   - Check your Supabase URL and API key
   - Ensure your database is set up correctly
   - Check browser console for detailed errors

2. **Chart not displaying**
   - Make sure Chart.js is loaded
   - Check if data is being fetched correctly
   - Verify canvas element exists

3. **No data showing**
   - Run the sample data script
   - Check if tables have data
   - Verify Supabase connection

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your Supabase configuration
3. Ensure all database scripts ran successfully
4. Check the network tab for API calls

Your Angular app is now fully integrated with Supabase! 🎉
