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
      .order('consumption_date', { ascending: true });

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
}
