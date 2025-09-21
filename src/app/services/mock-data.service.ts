import { Injectable } from '@angular/core';
import frenchData from '../../assets/data/french-demo-data.json';

// Interfaces for type safety
export interface AlarmCategory {
  type: string;
  count: number;
  severity: string;
  color: string;
  loading?: boolean;
  error?: string;
}

export interface AlarmMessage {
  id: string;
  device_id: string;
  building_id: string;
  alarm_type_id: string;
  message: string;
  status: string;
  created_at: string;
  resolved_at?: string;
  device_serial: string;
  device_name: string;
  device_status: string;
  building_name: string;
  building_address: string;
  building_group_name?: string;
  alarm_type_name: string;
  alarm_severity: string;
  alarm_color: string;
  // Additional properties for template compatibility
  alarm_type?: string;
  devices?: {
    apartments?: {
      buildings?: {
        building_name?: string;
        address?: string;
        building_number?: string;
        street_number?: string;
        additional_address?: string;
      };
      apartment_number?: string;
    };
  };
  alarm_types?: {
    type_name?: string;
  };
  action_taken?: string;
  tenant?: string;
}

export interface DailyConsumption {
  date: string;
  consumption: number;
}

export interface DeviceStatus {
  id: string;
  name: string;
  status: string;
  lastReading: number;
  batteryLevel: number;
}

export interface MonthlyStats {
  month: string;
  consumption: number;
  cost: number;
  efficiency: number;
}

export interface BuildingGroup {
  id: string;
  name: string;
  address: string;
  buildingCount: number;
  apartmentCount: number;
  deviceCount: number;
  group?: string;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  buildingGroup: string;
  apartmentCount: number;
  deviceCount: number;
}

export interface Apartment {
  id: string;
  number: string;
  building: string;
  buildingGroup: string;
  tenant: string;
  deviceCount: number;
}

export interface ConsumptionData {
  time_label: string;
  consumption_m3: number;
  device_name: string;
  building_name: string;
  building_group_name: string;
  device_count: number;
}

export interface TimePeriod {
  id: string;
  name: string;
  description: string;
}

export interface ChartType {
  id: string;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private frenchData = frenchData;

  constructor() {}

  // Alarm Categories
  getAlarmCategories(): Promise<AlarmCategory[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const categories = [
          {
            type: 'major_leak',
            count: this.frenchData.alarms.filter(a => a.alarm_type_name === 'Major Leak').length,
            severity: 'high',
            color: '#dc3545'
          },
          {
            type: 'auto_shutoff',
            count: this.frenchData.alarms.filter(a => a.alarm_type_name === 'Auto Shutoff').length,
            severity: 'high',
            color: '#dc3545'
          },
          {
            type: 'low_temperature',
            count: this.frenchData.alarms.filter(a => a.alarm_type_name === 'Low Temperature').length,
            severity: 'medium',
            color: '#ffc107'
          },
          {
            type: 'medium_leak',
            count: this.frenchData.alarms.filter(a => a.alarm_type_name === 'Minor Leak').length,
            severity: 'medium',
            color: '#ffc107'
          },
          {
            type: 'micro_leak',
            count: this.frenchData.alarms.filter(a => a.alarm_type_name === 'Micro Leak').length,
            severity: 'low',
            color: '#17a2b8'
          },
          {
            type: 'wifi_connection_lost',
            count: this.frenchData.alarms.filter(a => a.alarm_type_name === 'Wifi Connection Lost').length,
            severity: 'low',
            color: '#6c757d'
          },
          {
            type: 'power_loss',
            count: this.frenchData.alarms.filter(a => a.alarm_type_name === 'Power Loss').length,
            severity: 'high',
            color: '#dc3545'
          },
          {
            type: 'valve_failure',
            count: this.frenchData.alarms.filter(a => a.alarm_type_name === 'Valve Failure').length,
            severity: 'medium',
            color: '#ffc107'
          },
          {
            type: 'poor_wifi',
            count: this.frenchData.alarms.filter(a => a.alarm_type_name === 'Poor WiFi').length,
            severity: 'low',
            color: '#6c757d'
          }
        ];
        resolve(categories);
      }, 500);
    });
  }

  // Alarm Messages
  getAlarmMessages(page: number = 1, pageSize: number = 10, sortBy: string = 'created_at', sortDirection: string = 'DESC'): Promise<{alarms: AlarmMessage[], totalCount: number, totalPages: number, currentPage: number}> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const alarms = this.frenchData.alarms.map(alarm => ({
          ...alarm,
          resolved_at: alarm.resolved_at || undefined,
          devices: {
            apartments: {
              buildings: {
                building_name: alarm.building_name,
                address: alarm.building_address,
                building_number: alarm.building_address.split(',')[1]?.trim() || '',
                street_number: alarm.building_address.split(',')[1]?.trim() || '',
                additional_address: ''
              },
              apartment_number: alarm.apartment_id ? `Apt ${alarm.apartment_id.split('-')[1]}` : 'N/A'
            }
          },
          alarm_types: {
            type_name: alarm.alarm_type_name
          },
          action_taken: alarm.action_taken || 'En cours d\'analyse',
          tenant: alarm.tenant || 'N/A'
        })) as AlarmMessage[];

        // Sort alarms
        alarms.sort((a, b) => {
          const aValue = a[sortBy as keyof AlarmMessage] as any;
          const bValue = b[sortBy as keyof AlarmMessage] as any;
          
          if (sortDirection === 'ASC') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });

        const totalCount = alarms.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedAlarms = alarms.slice(startIndex, endIndex);

        resolve({
          alarms: paginatedAlarms,
          totalCount,
          totalPages,
          currentPage: page
        });
      }, 300);
    });
  }

  // Building Groups
  getBuildingGroups(page: number = 1, pageSize: number = 8): Promise<{buildingGroups: BuildingGroup[], totalCount: number, totalPages: number, currentPage: number}> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const buildingGroups = this.frenchData.buildingGroups.map(group => ({
          id: group.id,
          name: group.name,
          address: group.address,
          buildingCount: group.total_buildings,
          apartmentCount: group.total_apartments,
          deviceCount: group.total_devices,
          group: group.name
        }));

        const totalCount = buildingGroups.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedGroups = buildingGroups.slice(startIndex, endIndex);

        resolve({
          buildingGroups: paginatedGroups,
          totalCount,
          totalPages,
          currentPage: page
        });
      }, 200);
    });
  }

  // Buildings
  getBuildings(page: number = 1, pageSize: number = 8): Promise<{buildings: Building[], totalCount: number, totalPages: number, currentPage: number}> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const buildings = this.frenchData.buildings.map(building => ({
          id: building.id,
          name: building.name,
          address: building.address,
          buildingGroup: this.frenchData.buildingGroups.find(g => g.id === building.building_group_id)?.name || 'N/A',
          apartmentCount: building.total_apartments,
          deviceCount: building.total_devices
        }));

        const totalCount = buildings.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedBuildings = buildings.slice(startIndex, endIndex);

        resolve({
          buildings: paginatedBuildings,
          totalCount,
          totalPages,
          currentPage: page
        });
      }, 200);
    });
  }

  // Apartments
  getApartments(page: number = 1, pageSize: number = 8): Promise<{apartments: Apartment[], totalCount: number, totalPages: number, currentPage: number}> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const apartments = this.frenchData.apartments.map(apartment => {
          const building = this.frenchData.buildings.find(b => b.id === apartment.building_id);
          const buildingGroup = building ? this.frenchData.buildingGroups.find(g => g.id === building.building_group_id) : null;
          const tenant = this.frenchData.tenants.find(t => t.apartment_id === apartment.id);

          return {
            id: apartment.id,
            number: apartment.apartment_number,
            building: building?.name || 'N/A',
            buildingGroup: buildingGroup?.name || 'N/A',
            tenant: tenant ? `${tenant.first_name} ${tenant.last_name}` : 'N/A',
            deviceCount: 1 // Each apartment has exactly 1 device
          };
        });

        const totalCount = apartments.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedApartments = apartments.slice(startIndex, endIndex);

        resolve({
          apartments: paginatedApartments,
          totalCount,
          totalPages,
          currentPage: page
        });
      }, 200);
    });
  }

  // Monthly Stats
  getMonthlyStats(): Promise<MonthlyStats[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stats = this.frenchData.monthlyStats.map(stat => ({
          month: stat.month,
          consumption: stat.total_consumption,
          cost: stat.total_cost,
          efficiency: stat.efficiency_score
        }));
        resolve(stats);
      }, 300);
    });
  }

  // Daily Consumption
  getDailyConsumption(): Promise<DailyConsumption[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const consumption = this.frenchData.dailyConsumption.map(day => ({
          date: day.date,
          consumption: day.total_consumption
        }));
        resolve(consumption);
      }, 200);
    });
  }

  // Device Status
  getDeviceStatus(): Promise<DeviceStatus[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const devices = this.frenchData.devices.map(device => ({
          id: device.id,
          name: device.serial_number,
          status: device.status,
          lastReading: device.current_reading,
          batteryLevel: device.battery_level
        }));
        resolve(devices);
      }, 200);
    });
  }

  // Consumption Data for Charts
  getConsumptionByApartment(apartmentId: string, timePeriod: string, chartType: string): Promise<ConsumptionData[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Filter consumption data for specific apartment
        const apartmentConsumption = this.frenchData.consumptionData.filter(c => c.apartment_id === apartmentId);
        
        const consumptionData = apartmentConsumption.map(cons => ({
          time_label: cons.consumption_hour.toString(),
          consumption_m3: cons.consumption_m3,
          device_name: this.frenchData.devices.find(d => d.id === cons.device_id)?.serial_number || 'N/A',
          building_name: this.frenchData.buildings.find(b => b.id === cons.building_id)?.name || 'N/A',
          building_group_name: this.frenchData.buildingGroups.find(g => g.id === this.frenchData.buildings.find(b => b.id === cons.building_id)?.building_group_id)?.name || 'N/A',
          device_count: 1
        }));

        resolve(consumptionData);
      }, 300);
    });
  }

  getConsumptionByBuilding(buildingId: string, timePeriod: string, chartType: string): Promise<ConsumptionData[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Filter consumption data for specific building
        const buildingConsumption = this.frenchData.consumptionData.filter(c => c.building_id === buildingId);
        
        // Group by hour and sum consumption
        const groupedData = buildingConsumption.reduce((acc, cons) => {
          const hour = cons.consumption_hour;
          if (!acc[hour]) {
            acc[hour] = {
              time_label: hour.toString(),
              consumption_m3: 0,
              device_name: this.frenchData.devices.find(d => d.id === cons.device_id)?.serial_number || 'N/A',
              building_name: this.frenchData.buildings.find(b => b.id === cons.building_id)?.name || 'N/A',
              building_group_name: this.frenchData.buildingGroups.find(g => g.id === this.frenchData.buildings.find(b => b.id === cons.building_id)?.building_group_id)?.name || 'N/A',
              device_count: 0
            };
          }
          acc[hour].consumption_m3 += cons.consumption_m3;
          acc[hour].device_count += 1;
          return acc;
        }, {} as Record<number, ConsumptionData>);

        const consumptionData = Object.values(groupedData);
        resolve(consumptionData);
      }, 300);
    });
  }

  getConsumptionByBuildingGroup(buildingGroupId: string, timePeriod: string, chartType: string): Promise<ConsumptionData[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get all buildings in the group
        const groupBuildings = this.frenchData.buildings.filter(b => b.building_group_id === buildingGroupId);
        const buildingIds = groupBuildings.map(b => b.id);
        
        // Filter consumption data for all buildings in the group
        const groupConsumption = this.frenchData.consumptionData.filter(c => buildingIds.includes(c.building_id));
        
        // Group by hour and sum consumption
        const groupedData = groupConsumption.reduce((acc, cons) => {
          const hour = cons.consumption_hour;
          if (!acc[hour]) {
            acc[hour] = {
              time_label: hour.toString(),
              consumption_m3: 0,
              device_name: 'Multiple Devices',
              building_name: 'Multiple Buildings',
              building_group_name: this.frenchData.buildingGroups.find(g => g.id === buildingGroupId)?.name || 'N/A',
              device_count: 0
            };
          }
          acc[hour].consumption_m3 += cons.consumption_m3;
          acc[hour].device_count += 1;
          return acc;
        }, {} as Record<number, ConsumptionData>);

        const consumptionData = Object.values(groupedData);
        resolve(consumptionData);
      }, 300);
    });
  }

  // Time Periods
  getTimePeriods(): Promise<TimePeriod[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.frenchData.timePeriods);
      }, 100);
    });
  }

  // Chart Types
  getChartTypes(): Promise<ChartType[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(this.frenchData.chartTypes);
      }, 100);
    });
  }

  // Tenants
  getTenants(): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const tenants = this.frenchData.tenants.map(tenant => ({
          id: tenant.id,
          first_name: tenant.first_name,
          last_name: tenant.last_name,
          email: tenant.email,
          phone: tenant.phone,
          mobile_phone: tenant.mobile_phone,
          apartment_id: tenant.apartment_id,
          move_in_date: tenant.move_in_date,
          is_active: tenant.is_active
        }));
        resolve(tenants);
      }, 200);
    });
  }

  // Get apartments for a specific building
  getApartmentsByBuilding(buildingId: string): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const buildingApartments = this.frenchData.apartments.filter(apt => apt.building_id === buildingId);
        const apartments = buildingApartments.map(apartment => {
          const building = this.frenchData.buildings.find(b => b.id === apartment.building_id);
          const buildingGroup = building ? this.frenchData.buildingGroups.find(g => g.id === building.building_group_id) : null;
          const tenant = this.frenchData.tenants.find(t => t.apartment_id === apartment.id);

          return {
            id: apartment.id,
            number: apartment.apartment_number,
            building: building?.name || 'N/A',
            buildingGroup: buildingGroup?.name || 'N/A',
            tenant: tenant ? `${tenant.first_name} ${tenant.last_name}` : 'N/A',
            deviceCount: 1,
            floor: apartment.floor,
            surface_area: apartment.surface_area,
            rooms: apartment.rooms,
            water_price_per_m3: apartment.water_price_per_m3,
            created_at: apartment.created_at
          };
        });
        resolve(apartments);
      }, 200);
    });
  }

  // Get buildings for a specific building group
  getBuildingsByGroup(buildingGroupId: string): Promise<any[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const groupBuildings = this.frenchData.buildings.filter(b => b.building_group_id === buildingGroupId);
        const buildings = groupBuildings.map(building => ({
          id: building.id,
          name: building.name,
          address: building.address,
          buildingGroup: this.frenchData.buildingGroups.find(g => g.id === building.building_group_id)?.name || 'N/A',
          apartmentCount: building.total_apartments,
          deviceCount: building.total_devices,
          street_number: building.street_number,
          additional_address: building.additional_address,
          zip_code: building.zip_code,
          city: building.city,
          city_id: building.city_id,
          created_at: building.created_at
        }));
        resolve(buildings);
      }, 200);
    });
  }

  // Helper method for notifications
  showNotification(message: string): void {
    console.log('Notification:', message);
    // In a real app, this would show a toast notification
  }
}