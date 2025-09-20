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
      console.log('🔄 Fetching alarms from message board view...');
      
      // Try to fetch from the view first
      const { data: alarmsData, error: alarmsError } = await this.supabase
        .from('alarms_message_board')
        .select('*')
        .order('created_at', { ascending: false });

      if (alarmsError) {
        console.error('❌ Error fetching from view:', alarmsError);
        
        // Fallback to the simple function
        const { data: functionData, error: functionError } = await this.supabase
          .rpc('get_alarms_message_board_simple');

        if (functionError) {
          console.error('❌ Error fetching from function:', functionError);
          throw new Error(`Failed to fetch alarms: ${functionError.message}`);
        }

        console.log('✅ Alarms loaded from function:', functionData?.length || 0, 'items');
        return functionData || [];
      }
      
      console.log('✅ Alarms loaded from view:', alarmsData?.length || 0, 'items');
      return alarmsData || [];

    } catch (error: any) {
      console.error('❌ Critical error in getAlarmsMessageBoard:', error);
      throw new Error(`Failed to fetch alarms: ${error.message}`);
    } finally {
      // Restore original console.error
      console.error = originalConsoleError;
    }
  }

  async getAlarmsMessageBoardPaginated(
    page: number = 1, 
    pageSize: number = 10, 
    sortBy: string = 'created_at', 
    sortDirection: string = 'DESC'
  ): Promise<{alarms: AlarmMessageBoard[], totalCount: number, totalPages: number, currentPage: number}> {
    try {
      console.log(`🔄 Fetching paginated alarms: page ${page}, size ${pageSize}`);
      
      const { data, error } = await this.supabase
        .rpc('get_alarms_message_board', {
          page_number: page,
          page_size: pageSize,
          sort_by: sortBy,
          sort_direction: sortDirection
        });

      if (error) {
        console.error('❌ Error fetching paginated alarms:', error);
        throw new Error(`Failed to fetch paginated alarms: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return {
          alarms: [],
          totalCount: 0,
          totalPages: 0,
          currentPage: page
        };
      }

      const result = data[0];
      console.log('✅ Paginated alarms loaded:', result);
      
      return {
        alarms: result.alarms || [],
        totalCount: result.total_count || 0,
        totalPages: result.total_pages || 0,
        currentPage: result.current_page || page
      };
    } catch (error: any) {
      console.error('❌ Critical error in getAlarmsMessageBoardPaginated:', error);
      throw new Error(`Failed to fetch paginated alarms: ${error.message}`);
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
