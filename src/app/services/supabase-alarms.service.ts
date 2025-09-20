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

export interface AlarmStatistics {
  major_alarms_current: number;
  system_alarms_current: number;
  total_leakage_alarms: number;
  active_leakage_alarms: number;
  total_estimated_loss_m3: number;
  total_water_saved_m3: number;
  alarms_last_24h: number;
  resolved_alarms: number;
  total_alarms: number;
  latest_alarm_date: string;
  earliest_alarm_date: string;
}

export interface ConsumptionStatistics {
  current_year_total_m3: number;
  current_year_to_sept_m3: number;
  previous_year_total_m3: number;
  previous_year_to_sept_m3: number;
  year_2024_total_m3: number;
  year_2023_total_m3: number;
  year_2022_total_m3: number;
  current_month_m3: number;
  previous_month_m3: number;
  monthly_data: any[];
}

export interface AlarmCategory {
  category_type: 'major' | 'minor' | 'system';
  major_leaks: number;
  auto_shutoff_non_resolved: number;
  low_temperature: number;
  medium_leaks: number;
  minor_leaks: number;
  wifi_connection_lost: number;
  power_loss: number;
  valve_failure: number;
  poor_wifi: number;
}

export interface AlarmCategories {
  major: {
    major_leaks: number;
    auto_shutoff_non_resolved: number;
    low_temperature: number;
  };
  minor: {
    medium_leaks: number;
    minor_leaks: number;
  };
  system: {
    wifi_connection_lost: number;
    power_loss: number;
    valve_failure: number;
    poor_wifi: number;
  };
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

  async getAlarmStatistics(): Promise<AlarmStatistics> {
    try {
      console.log('🔄 Calling get_alarm_statistics RPC function...');
      
      // Use RPC call to execute the function
      const { data, error } = await this.supabase
        .rpc('get_alarm_statistics');

      console.log('📊 RPC Response:', { data, error });

      if (error) {
        console.error('❌ Error fetching alarm statistics:', error);
        throw new Error(`Failed to fetch alarm statistics: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No data returned from get_alarm_statistics function');
        // Return default values
        return {
          major_alarms_current: 0,
          system_alarms_current: 0,
          total_leakage_alarms: 0,
          active_leakage_alarms: 0,
          total_estimated_loss_m3: 0,
          total_water_saved_m3: 0,
          alarms_last_24h: 0,
          resolved_alarms: 0,
          total_alarms: 0,
          latest_alarm_date: new Date().toISOString(),
          earliest_alarm_date: new Date().toISOString()
        };
      }

      // The function returns an array, so get the first (and only) result
      const result = data[0] as AlarmStatistics;
      console.log('✅ Alarm statistics loaded:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Critical error in getAlarmStatistics:', error);
      throw new Error(`Failed to fetch alarm statistics: ${error.message}`);
    }
  }

  async getConsumptionStatistics(): Promise<ConsumptionStatistics> {
    try {
      console.log('🔄 Calling get_consumption_statistics RPC function...');
      
      // Use RPC call to execute the function
      const { data, error } = await this.supabase
        .rpc('get_consumption_statistics');

      console.log('📊 Consumption RPC Response:', { data, error });

      if (error) {
        console.error('❌ Error fetching consumption statistics:', error);
        throw new Error(`Failed to fetch consumption statistics: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No data returned from get_consumption_statistics function');
        // Return default values
        return {
          current_year_total_m3: 0,
          current_year_to_sept_m3: 0,
          previous_year_total_m3: 0,
          previous_year_to_sept_m3: 0,
          year_2024_total_m3: 0,
          year_2023_total_m3: 0,
          year_2022_total_m3: 0,
          current_month_m3: 0,
          previous_month_m3: 0,
          monthly_data: []
        };
      }

      // The function returns an array, so get the first (and only) result
      const result = data[0] as ConsumptionStatistics;
      console.log('✅ Consumption statistics loaded:', result);
      return result;
    } catch (error: any) {
      console.error('❌ Critical error in getConsumptionStatistics:', error);
      throw new Error(`Failed to fetch consumption statistics: ${error.message}`);
    }
  }

  async getAlarmCategories(): Promise<AlarmCategories> {
    try {
      console.log('🔄 Calling get_alarm_categories RPC function...');
      
      // Use RPC call to execute the function
      const { data, error } = await this.supabase
        .rpc('get_alarm_categories');

      console.log('📊 Alarm Categories RPC Response:', { data, error });

      if (error) {
        console.error('❌ Error fetching alarm categories:', error);
        throw new Error(`Failed to fetch alarm categories: ${error.message}`);
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ No data returned from get_alarm_categories function');
        // Return default values
        return {
          major: {
            major_leaks: 0,
            auto_shutoff_non_resolved: 0,
            low_temperature: 0
          },
          minor: {
            medium_leaks: 0,
            minor_leaks: 0
          },
          system: {
            wifi_connection_lost: 0,
            power_loss: 0,
            valve_failure: 0,
            poor_wifi: 0
          }
        };
      }

      // Transform the array data into the structured format
      const categories: AlarmCategories = {
        major: {
          major_leaks: 0,
          auto_shutoff_non_resolved: 0,
          low_temperature: 0
        },
        minor: {
          medium_leaks: 0,
          minor_leaks: 0
        },
        system: {
          wifi_connection_lost: 0,
          power_loss: 0,
          valve_failure: 0,
          poor_wifi: 0
        }
      };

      // Process each category
      data.forEach((category: AlarmCategory) => {
        if (category.category_type === 'major') {
          categories.major = {
            major_leaks: category.major_leaks,
            auto_shutoff_non_resolved: category.auto_shutoff_non_resolved,
            low_temperature: category.low_temperature
          };
        } else if (category.category_type === 'minor') {
          categories.minor = {
            medium_leaks: category.medium_leaks,
            minor_leaks: category.minor_leaks
          };
        } else if (category.category_type === 'system') {
          categories.system = {
            wifi_connection_lost: category.wifi_connection_lost,
            power_loss: category.power_loss,
            valve_failure: category.valve_failure,
            poor_wifi: category.poor_wifi
          };
        }
      });

      console.log('✅ Alarm categories loaded:', categories);
      return categories;
    } catch (error: any) {
      console.error('❌ Critical error in getAlarmCategories:', error);
      throw new Error(`Failed to fetch alarm categories: ${error.message}`);
    }
  }
}
