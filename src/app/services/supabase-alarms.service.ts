import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface AlarmMessageBoard {
  id: string;
  device_id: string;
  building_id: string;
  alarm_type_id: string;
  message: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
  device_serial: string;
  device_name: string;
  device_status: string;
  building_name: string;
  building_address: string;
  building_group_name: string;
  alarm_type_name: string;
  alarm_severity: string;
  alarm_color: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseAlarmsService {
  private supabase: SupabaseClient;

  constructor() {
    try {
      this.supabase = createClient(
        environment.supabase.url,
        environment.supabase.anonKey,
        {
          auth: {
            persistSession: false, // Disable session persistence to avoid lock issues
            autoRefreshToken: false, // Disable auto refresh to avoid lock issues
            detectSessionInUrl: false // Disable URL session detection
          }
        }
      );
    } catch (error) {
      console.warn('Supabase client creation warning:', error);
      // Fallback to basic client creation
      this.supabase = createClient(
        environment.supabase.url,
        environment.supabase.anonKey
      );
    }
  }

  async getAlarmsMessageBoard(): Promise<AlarmMessageBoard[]> {
    // Suppress NavigatorLockAcquireTimeoutError warnings
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (args[0] && args[0].includes && args[0].includes('NavigatorLockAcquireTimeoutError')) {
        console.warn('⚠️ Supabase lock warning (safe to ignore):', args[0]);
        return;
      }
      originalConsoleError.apply(console, args);
    };

    try {
      // First, let's try to fetch from the alarms table directly to test connection
      const { data: testData, error: testError } = await this.supabase
        .from('alarms')
        .select('id, message, created_at')
        .limit(1);

      if (testError) {
        console.error('❌ Test connection failed:', testError);
        throw new Error(`Connection test failed: ${testError.message}`);
      }

      // Now try the view
      const { data: alarmsData, error: alarmsError } = await this.supabase
        .from('alarms_message_board')
        .select('*')
        .order('created_at', { ascending: false });

      if (alarmsError) {
        console.error('❌ Error fetching from view:', alarmsError);
        // If view doesn't exist, fall back to basic alarms data
        const { data: fallbackData, error: fallbackError } = await this.supabase
          .from('alarms')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);

        if (fallbackError) {
          throw new Error(`Fallback failed: ${fallbackError.message}`);
        }

        // Transform fallback data to match our interface
        const transformedData = fallbackData?.map(alarm => ({
          id: alarm.id,
          device_id: alarm.device_id || '',
          building_id: alarm.building_id || '',
          alarm_type_id: alarm.alarm_type_id || '',
          message: alarm.message || 'No message',
          status: alarm.status || 'unknown',
          created_at: alarm.created_at,
          resolved_at: alarm.resolved_at,
          device_serial: 'N/A',
          device_name: 'N/A',
          device_status: 'unknown',
          building_name: 'N/A',
          building_address: 'N/A',
          building_group_name: 'N/A',
          alarm_type_name: alarm.alarm_type || 'Unknown',
          alarm_severity: 'medium',
          alarm_color: '#666'
        })) || [];

        return transformedData;
      }
      
      return alarmsData || [];

    } catch (error: any) {
      console.error('❌ Critical error in getAlarmsMessageBoard:', error);
      throw new Error(`Failed to fetch alarms: ${error.message}`);
    } finally {
      // Restore original console.error
      console.error = originalConsoleError;
    }
  }
}
