# 🔍 **Verify Supabase Data - Troubleshooting Guide**

## **Step 1: Check Browser Console**

1. **Open your Angular app** in the browser
2. **Open Developer Tools** (F12)
3. **Go to Console tab**
4. **Click "Add Building"** button
5. **Look for these debug messages:**

```javascript
// You should see these messages:
Starting to load dropdown data...
Testing Supabase connection...
Connection test result: {success: true, data: ...}
Raw building groups response: [...]
Raw cities response: [...]
Processed building groups: [...]
Building groups count: 8
Cities count: 3
```

## **Step 2: Check for Errors**

If you see **0 groups**, look for error messages like:

### **❌ Connection Errors:**
```javascript
Connection test failed: {error details}
```

### **❌ Authentication Errors:**
```javascript
Error: Invalid API key
Error: JWT expired
```

### **❌ Database Errors:**
```javascript
Error: relation "building_groups" does not exist
Error: permission denied
```

## **Step 3: Manual Database Check**

### **Option A: Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to **Table Editor**
3. Check if `building_groups` table exists
4. Check if it has 8 rows of data

### **Option B: SQL Query**
Run this query in Supabase SQL Editor:

```sql
-- Check if building_groups table exists and has data
SELECT COUNT(*) as total_groups FROM building_groups;

-- Check the actual data
SELECT id, group_name, description, created_at 
FROM building_groups 
ORDER BY created_at DESC;
```

## **Step 4: Verify Sample Data Script**

Make sure you ran the correct script:

1. **Check if you ran:** `supabase_sample_data_simple.sql`
2. **Not:** `supabase_sample_data.sql` (this one has UUID errors)

## **Step 5: Common Issues & Solutions**

### **🔧 Issue 1: No Data in Database**
**Solution:** Run the sample data script
```sql
-- Run this in Supabase SQL Editor
-- Copy and paste the entire content of supabase_sample_data_simple.sql
```

### **🔧 Issue 2: Wrong Environment Variables**
**Check:** `src/environments/environment.ts`
```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'https://miunuyszqtluyjelxcvz.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
};
```

### **🔧 Issue 3: RLS (Row Level Security) Blocking**
**Solution:** Check if RLS is enabled and blocking anonymous access
```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'building_groups';

-- If RLS is enabled, you might need to create policies
```

### **🔧 Issue 4: Network/CORS Issues**
**Check:** Browser Network tab for failed requests to `api.supabase.co`

## **Step 6: Quick Test Script**

If you have Node.js installed, you can run this test:

```bash
# Install dependencies
npm install @supabase/supabase-js

# Run the test
node test-supabase-data.js
```

## **Expected Results**

### **✅ Success Indicators:**
- Console shows: `Building groups count: 8`
- Console shows: `Cities count: 3`
- Dropdown shows: "Select Building Group (8 available)"
- 8 options visible in dropdown

### **❌ Failure Indicators:**
- Console shows: `Building groups count: 0`
- Console shows: `Cities count: 0`
- Dropdown shows: "Select Building Group (0 available)"
- Error messages in console

## **Next Steps**

1. **Check the console output** and let me know what you see
2. **If you see errors**, share the exact error message
3. **If you see 0 groups**, we'll need to verify the database data
4. **If everything looks correct**, the issue might be in the UI rendering

**Let me know what the console shows when you click "Add Building"!** 🔍
