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
   * Get all apartments data (for now using hardcoded data, can be replaced with real data later)
   */
  async getApartments(): Promise<Apartment[]> {
    // For now, return hardcoded data
    // This can be replaced with a real database query later
    return [
      { id: 1, apartment: 'Block 1, L2, APT 12', tenant: 'Mr. Francois Duc de la Roche Focault' },
      { id: 2, apartment: 'L23, APT 3', tenant: 'Mr. Napoleon Bonaparte' },
      { id: 3, apartment: 'Block 3, L45, APT 23', tenant: 'Mr. Gerard Depardieu' },
      { id: 4, apartment: 'Block, 32 L1, APT1', tenant: 'Mr. Luis Vuitton' },
      { id: 5, apartment: 'Block 4, L12, APT 5', tenant: 'Mr. Jean Dupont' },
      { id: 6, apartment: 'L34, APT 7', tenant: 'Ms. Marie Martin' },
      { id: 7, apartment: 'Block 5, L56, APT 9', tenant: 'Mr. Pierre Bernard' },
      { id: 8, apartment: 'Block 6, L78, APT 11', tenant: 'Ms. Sophie Thomas' },
      { id: 9, apartment: 'L90, APT 13', tenant: 'Mr. Jean Petit' },
      { id: 10, apartment: 'Block 7, L23, APT 15', tenant: 'Ms. Anne Robert' },
      { id: 11, apartment: 'Block 8, L45, APT 17', tenant: 'Mr. Michel Richard' },
      { id: 12, apartment: 'L67, APT 19', tenant: 'Ms. Claire Durand' }
    ];
  }
}
