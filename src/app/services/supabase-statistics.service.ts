import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface BuildingGroup {
  id: number;
  group: string;
  building: string;
  zipCode: string;
  address: string;
  device_count?: number;
  active_devices?: number;
  maintenance_devices?: number;
  inactive_devices?: number;
  total_alarms?: number;
  active_alarms?: number;
  resolved_alarms?: number;
  total_consumption_m3?: number;
  avg_daily_consumption_m3?: number;
}

export interface BuildingGroupResponse {
  building_groups: BuildingGroup[];
  total_count: number;
  total_pages: number;
  current_page: number;
}

export interface Building {
  id: number;
  building: string;
  zipCode: string;
  address: string;
  apartment?: string;
  tenant?: string;
}

export interface Apartment {
  id: number;
  apartment: string;
  tenant: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseStatisticsService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);
  }

  /**
   * Get paginated building groups data
   */
  async getBuildingGroups(
    page: number = 1, 
    pageSize: number = 8, 
    sortBy: string = 'group_name', 
    sortDirection: string = 'ASC'
  ): Promise<BuildingGroupResponse> {
    try {
      console.log(`🔄 Fetching building groups: page ${page}, size ${pageSize}`);
      
      const { data, error } = await this.supabase
        .rpc('get_statistics_building_groups', {
          page_number: page,
          page_size: pageSize,
          sort_by: sortBy,
          sort_direction: sortDirection
        });

      if (error) {
        console.error('❌ Error fetching building groups:', error);
        throw new Error(`Failed to fetch building groups: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return {
          building_groups: [],
          total_count: 0,
          total_pages: 0,
          current_page: page
        };
      }

      const result = data[0];
      console.log('✅ Building groups loaded:', result);
      
      return {
        building_groups: result.building_groups || [],
        total_count: result.total_count || 0,
        total_pages: result.total_pages || 0,
        current_page: result.current_page || page
      };
    } catch (error: any) {
      console.error('❌ Critical error in getBuildingGroups:', error);
      throw new Error(`Failed to fetch building groups: ${error.message}`);
    }
  }

  /**
   * Get paginated buildings data from Supabase
   */
  async getBuildings(
    page: number = 1, 
    pageSize: number = 8, 
    sortBy: string = 'building_name', 
    sortDirection: string = 'ASC'
  ): Promise<{buildings: Building[], total_count: number, total_pages: number, current_page: number}> {
    try {
      console.log(`🔄 Fetching buildings: page ${page}, size ${pageSize}`);
      
      const { data, error } = await this.supabase
        .rpc('get_statistics_buildings', {
          page_number: page,
          page_size: pageSize,
          sort_by: sortBy,
          sort_direction: sortDirection
        });

      if (error) {
        console.error('❌ Error fetching buildings:', error);
        throw new Error(`Failed to fetch buildings: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return {
          buildings: [],
          total_count: 0,
          total_pages: 0,
          current_page: page
        };
      }

      const result = data[0];
      console.log('✅ Buildings loaded:', result);
      
      return {
        buildings: result.buildings || [],
        total_count: result.total_count || 0,
        total_pages: result.total_pages || 0,
        current_page: result.current_page || page
      };
    } catch (error: any) {
      console.error('❌ Critical error in getBuildings:', error);
      throw new Error(`Failed to fetch buildings: ${error.message}`);
    }
  }

  /**
   * Get paginated apartments data from Supabase
   */
  async getApartments(
    page: number = 1, 
    pageSize: number = 8, 
    sortBy: string = 'apartment', 
    sortDirection: string = 'ASC'
  ): Promise<{apartments: Apartment[], total_count: number, total_pages: number, current_page: number}> {
    try {
      console.log(`🔄 Fetching apartments: page ${page}, size ${pageSize}`);
      
      const { data, error } = await this.supabase
        .rpc('get_statistics_apartments', {
          page_number: page,
          page_size: pageSize,
          sort_by: sortBy,
          sort_direction: sortDirection
        });

      if (error) {
        console.error('❌ Error fetching apartments:', error);
        throw new Error(`Failed to fetch apartments: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return {
          apartments: [],
          total_count: 0,
          total_pages: 0,
          current_page: page
        };
      }

      const result = data[0];
      console.log('✅ Apartments loaded:', result);
      
      return {
        apartments: result.apartments || [],
        total_count: result.total_count || 0,
        total_pages: result.total_pages || 0,
        current_page: result.current_page || page
      };
    } catch (error: any) {
      console.error('❌ Critical error in getApartments:', error);
      throw new Error(`Failed to fetch apartments: ${error.message}`);
    }
  }
}
