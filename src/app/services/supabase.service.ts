import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

export interface DailyConsumption {
  id: string;
  serial_number: string;
  consumption_date: string;
  consumption_liters: number;
  consumption_m3: number;
  is_manual_entry: boolean;
  entered_by_user_id: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Alarm {
  id: string;
  device_id: string;
  alarm_type: string;
  message: string;
  action_taken: string | null;
  estimated_loss_m3: number | null;
  water_savings_m3: number | null;
  created_at: string;
  updated_at: string;
  devices?: Device;
  alarm_types?: {
    type_name: string;
  };
}

export interface Device {
  id: string;
  serial_number: string;
  device_type_id: string;
  apartment_id: string | null;
  status: string;
  last_heartbeat: string;
  battery_level: string;
  signal_strength: string;
  sensor_data: any;
  created_at: string;
  updated_at: string;
  apartments?: Apartment;
}

export interface Apartment {
  id: string;
  apartment_number: string;
  building_id: string;
  tenant_id: string | null;
  water_price_per_m3: number;
  created_at: string;
  updated_at: string;
  buildings?: Building;
  tenants?: Tenant;
}

export interface Building {
  id: string;
  building_name: string;
  street_number?: string | null;
  additional_address?: string | null;
  zip_code?: string | null;
  city?: string | null;
  city_id?: string | null;
  building_group_id: string;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  updated_at: string;
  building_groups?: BuildingGroup;
  cities?: City;
  apartments?: Apartment[];
}

export interface BuildingGroup {
  id: string;
  group_name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  buildings?: Building[];
}

export interface Tenant {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  mobile_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface City {
  id: string;
  name: string;
  country_code: string;
  region?: string | null;
  created_at: string;
}

export interface DeviceStatus {
  id: string;
  device_id: string;
  status: string;
  last_heartbeat: string;
  battery_level: string;
  signal_strength: string;
  created_at: string;
  updated_at: string;
}

export interface MonthlyStats {
  id: string;
  month: string;
  total_consumption_m3: number;
  total_consumption_liters: number;
  device_count: number;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabase.url, environment.supabase.anonKey);
  }

  // Daily Consumption Methods
  async getDailyConsumption(serialNumber?: string, startDate?: string, endDate?: string): Promise<DailyConsumption[]> {
    let query = this.supabase
      .from('daily_consumption')
      .select('*')
      .order('created_at', { ascending: false });

    if (serialNumber) {
      query = query.eq('serial_number', serialNumber);
    }

    if (startDate) {
      query = query.gte('consumption_date', startDate);
    }

    if (endDate) {
      query = query.lte('consumption_date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  // Alias for compatibility
  async getConsumptionData(): Promise<DailyConsumption[]> {
    return this.getDailyConsumption();
  }

  // Alarm Methods
  async getAlarms(): Promise<Alarm[]> {
    const { data, error } = await this.supabase
      .from('alarms')
      .select(`
        *,
        devices:device_id (
          *,
          apartments:apartment_id (
            *,
            buildings:building_id (
              *,
              building_groups:building_group_id (*),
              cities:city_id (*)
            ),
            tenants:tenant_id (*)
          )
        ),
        alarm_types:alarm_type (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Device Methods
  async getDevices(): Promise<Device[]> {
    const { data, error } = await this.supabase
      .from('devices')
      .select(`
        *,
        apartments:apartment_id (
          *,
          buildings:building_id (
            *,
            building_groups:building_group_id (*),
            cities:city_id (*)
          ),
          tenants:tenant_id (*)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Building Group Methods
  async getBuildingGroups(): Promise<BuildingGroup[]> {
    const { data, error } = await this.supabase
      .from('building_groups')
      .select(`
        *,
        buildings (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Building Methods
  async getBuildings(): Promise<Building[]> {
    const { data, error } = await this.supabase
      .from('buildings')
      .select(`
        *,
        building_groups:building_group_id (*),
        cities:city_id (*),
        apartments (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Apartment Methods
  async getApartments(): Promise<Apartment[]> {
    const { data, error } = await this.supabase
      .from('apartments')
      .select(`
        *,
        buildings:building_id (
          *,
          building_groups:building_group_id (*),
          cities:city_id (*)
        ),
        tenants:tenant_id (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Tenant Methods
  async getTenants(): Promise<Tenant[]> {
    const { data, error } = await this.supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // City Methods
  async getCities(): Promise<City[]> {
    const { data, error } = await this.supabase
      .from('cities')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  // Device Status Methods
  async getDeviceStatus(): Promise<DeviceStatus[]> {
    const { data, error } = await this.supabase
      .from('device_status')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Monthly Stats Methods
  async getMonthlyStats(): Promise<MonthlyStats[]> {
    const { data, error } = await this.supabase
      .from('monthly_consumption_summary')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Create Methods
  async createBuildingGroup(groupData: { group_name: string; description?: string | null }): Promise<BuildingGroup> {
    const { data, error } = await this.supabase
      .from('building_groups')
      .insert([groupData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createBuilding(buildingData: {
    building_name: string;
    street_number?: string | null;
    additional_address?: string | null;
    zip_code?: string | null;
    city?: string | null;
    city_id?: string | null;
    building_group_id: string;
    latitude?: number | null;
    longitude?: number | null;
  }): Promise<Building> {
    const { data, error } = await this.supabase
      .from('buildings')
      .insert([buildingData])
      .select(`
        *,
        building_groups:building_group_id (*),
        cities:city_id (*),
        apartments (*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  // Debug method to test connection
  async testConnection() {
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await this.supabase
        .from('building_groups')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Supabase connection test failed:', error);
        return { success: false, error };
      }
      
      console.log('Supabase connection test successful');
      return { success: true, data };
    } catch (err) {
      console.error('Supabase connection test error:', err);
      return { success: false, error: err };
    }
  }

  // Expose supabase client for direct access
  get supabaseClient() {
    return this.supabase;
  }
}
