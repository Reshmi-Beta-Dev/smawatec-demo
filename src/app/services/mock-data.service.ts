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
        // Generate additional alarm data to have 15+ alarms
        const additionalAlarms = this.generateAdditionalAlarms();
        const allAlarms = [...this.frenchData.alarms, ...additionalAlarms];
        
        const alarms = allAlarms.map(alarm => ({
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

  // Generate additional alarm data
  private generateAdditionalAlarms(): any[] {
    const alarmTypes = [
      { id: 'at-001', name: 'Major Leak', severity: 'high', color: '#dc3545' },
      { id: 'at-002', name: 'Minor Leak', severity: 'medium', color: '#ffc107' },
      { id: 'at-003', name: 'Micro Leak', severity: 'low', color: '#17a2b8' },
      { id: 'at-004', name: 'Auto Shutoff', severity: 'high', color: '#dc3545' },
      { id: 'at-005', name: 'Low Temperature', severity: 'medium', color: '#ffc107' },
      { id: 'at-006', name: 'Wifi Connection Lost', severity: 'low', color: '#6c757d' },
      { id: 'at-007', name: 'Power Loss', severity: 'high', color: '#dc3545' },
      { id: 'at-008', name: 'Valve Failure', severity: 'medium', color: '#ffc107' },
      { id: 'at-009', name: 'Poor WiFi', severity: 'low', color: '#6c757d' }
    ];

    const buildings = this.frenchData.buildings.slice(0, 15);
    const tenants = this.frenchData.tenants;
    const statuses = ['active', 'resolved', 'acknowledged'];
    const actions = [
      'Vanne principale fermée automatiquement',
      'Réparation effectuée par le plombier',
      'Tentative de reconnexion en cours',
      'En cours d\'analyse',
      'Maintenance programmée',
      'Signal faible détecté',
      'Intervention technique requise'
    ];

    const additionalAlarms = [];
    const now = new Date();

    for (let i = 4; i <= 15; i++) {
      const building = buildings[i % buildings.length];
      const alarmType = alarmTypes[Math.floor(Math.random() * alarmTypes.length)];
      const tenant = tenants[Math.floor(Math.random() * tenants.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      
      // Generate random date within last 30 days
      const randomDays = Math.floor(Math.random() * 30);
      const createdDate = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
      
      const alarm = {
        id: `alarm-${String(i).padStart(3, '0')}`,
        device_id: `dev-${String(i).padStart(3, '0')}`,
        apartment_id: `apt-${String(i).padStart(3, '0')}`,
        building_id: building.id,
        alarm_type_id: alarmType.id,
        message: `${alarmType.name} détecté dans l'appartement ${String(i).padStart(3, '0')}`,
        status: status,
        severity: alarmType.severity,
        created_at: createdDate.toISOString(),
        resolved_at: status === 'resolved' ? new Date(createdDate.getTime() + Math.random() * 24 * 60 * 60 * 1000).toISOString() : null,
        action_taken: action,
        device_serial: `SMW-${String(i).padStart(3, '0')}-${String(i).padStart(3, '0')}-01`,
        device_name: 'Compteur d\'eau principal',
        device_status: 'active',
        building_name: building.name,
        building_address: building.address,
        building_group_name: this.frenchData.buildingGroups.find(g => g.id === building.building_group_id)?.name || 'N/A',
        alarm_type_name: alarmType.name,
        alarm_severity: alarmType.severity,
        alarm_color: alarmType.color,
        tenant: `${tenant.first_name} ${tenant.last_name}`
      };

      additionalAlarms.push(alarm);
    }

    return additionalAlarms;
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
  getConsumptionByApartment(timePeriod: string, apartmentId: string, chartType: string): Promise<ConsumptionData[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate consumption data based on time period and apartment
        const data = this.generateConsumptionData(timePeriod, chartType, 'apartment', apartmentId);
        resolve(data);
      }, 300);
    });
  }

  getConsumptionByBuilding(timePeriod: string, buildingId: string, chartType: string): Promise<ConsumptionData[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate consumption data based on time period and building
        const data = this.generateConsumptionData(timePeriod, chartType, 'building', buildingId);
        resolve(data);
      }, 300);
    });
  }

  getConsumptionByBuildingGroup(timePeriod: string, buildingGroupId: string, chartType: string): Promise<ConsumptionData[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate consumption data based on time period and building group
        const data = this.generateConsumptionData(timePeriod, chartType, 'buildingGroup', buildingGroupId);
        resolve(data);
      }, 300);
    });
  }

  // Generate comprehensive consumption data based on time period and hierarchy level
  private generateConsumptionData(timePeriod: string, chartType: string, level: 'apartment' | 'building' | 'buildingGroup', id: string): ConsumptionData[] {
    const now = new Date();
    let dataPoints: number;
    let timeLabels: string[];
    let baseConsumption: number;

    // Determine data points and time labels based on time period
    switch (timePeriod) {
      case 'today':
        dataPoints = 24; // 24 hours
        timeLabels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
        baseConsumption = 0.1; // Base consumption per hour
        break;
      case 'last_month':
        dataPoints = 30; // 30 days
        timeLabels = Array.from({ length: 30 }, (_, i) => {
          const date = new Date(now);
          date.setDate(date.getDate() - (29 - i));
          return date.toISOString().split('T')[0];
        });
        baseConsumption = 2.5; // Base consumption per day
        break;
      case 'last_year':
        dataPoints = 12; // 12 months
        timeLabels = Array.from({ length: 12 }, (_, i) => {
          const date = new Date(now);
          date.setMonth(date.getMonth() - (11 - i));
          return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        });
        baseConsumption = 75; // Base consumption per month
        break;
      case 'last_5_years':
        dataPoints = 5; // 5 years
        timeLabels = Array.from({ length: 5 }, (_, i) => {
          const year = now.getFullYear() - (4 - i);
          return year.toString();
        });
        baseConsumption = 900; // Base consumption per year
        break;
      case 'future_year':
        dataPoints = 12; // 12 months (future)
        timeLabels = Array.from({ length: 12 }, (_, i) => {
          const date = new Date(now);
          date.setMonth(date.getMonth() + i + 1);
          return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        });
        baseConsumption = 80; // Slightly higher for future projection
        break;
      default:
        dataPoints = 24;
        timeLabels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
        baseConsumption = 0.1;
    }

    // Adjust base consumption based on hierarchy level
    let multiplier = 1;
    let deviceCount = 1;
    let buildingName = 'N/A';
    let buildingGroupName = 'N/A';

    switch (level) {
      case 'apartment':
        multiplier = 1;
        deviceCount = 1;
        // Find apartment details
        const apartment = this.frenchData.apartments.find(a => a.id === id);
        if (apartment) {
          const building = this.frenchData.buildings.find(b => b.id === apartment.building_id);
          if (building) {
            buildingName = building.name;
            const buildingGroup = this.frenchData.buildingGroups.find(g => g.id === building.building_group_id);
            if (buildingGroup) {
              buildingGroupName = buildingGroup.name;
            }
          }
        }
        break;
      case 'building':
        multiplier = 8; // Average 8 apartments per building
        deviceCount = 8;
        // Find building details
        const building = this.frenchData.buildings.find(b => b.id === id);
        if (building) {
          buildingName = building.name;
          const buildingGroup = this.frenchData.buildingGroups.find(g => g.id === building.building_group_id);
          if (buildingGroup) {
            buildingGroupName = buildingGroup.name;
          }
        }
        break;
      case 'buildingGroup':
        multiplier = 50; // Average 50 apartments per building group
        deviceCount = 50;
        // Find building group details
        const buildingGroup = this.frenchData.buildingGroups.find(g => g.id === id);
        if (buildingGroup) {
          buildingGroupName = buildingGroup.name;
          buildingName = 'Multiple Buildings';
        }
        break;
    }

    // Generate consumption data with realistic patterns
    const consumptionData: ConsumptionData[] = [];
    
    for (let i = 0; i < dataPoints; i++) {
      let consumption = baseConsumption * multiplier;
      
      // Add realistic variations based on time period
      if (timePeriod === 'today') {
        // Hourly pattern: higher during day, lower at night
        const hour = i;
        if (hour >= 6 && hour <= 22) {
          consumption *= (1 + Math.sin((hour - 6) * Math.PI / 16) * 0.5);
        } else {
          consumption *= 0.3; // Lower at night
        }
      } else if (timePeriod === 'last_month' || timePeriod === 'future_year') {
        // Daily/monthly pattern: higher on weekdays, lower on weekends
        const dayOfWeek = (i + 1) % 7;
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Weekend
          consumption *= 0.7;
        }
        // Add seasonal variation
        const month = (i % 12) + 1;
        if (month >= 6 && month <= 8) { // Summer months
          consumption *= 1.3;
        } else if (month >= 12 || month <= 2) { // Winter months
          consumption *= 0.8;
        }
      } else if (timePeriod === 'last_year') {
        // Monthly pattern: higher in summer, lower in winter
        const month = i + 1;
        if (month >= 6 && month <= 8) { // Summer
          consumption *= 1.4;
        } else if (month >= 12 || month <= 2) { // Winter
          consumption *= 0.7;
        }
      } else if (timePeriod === 'last_5_years') {
        // Yearly pattern: gradual increase over years
        consumption *= (1 + i * 0.1); // 10% increase per year
      }

      // Add random variation (±20%)
      const randomVariation = 0.8 + Math.random() * 0.4;
      consumption *= randomVariation;

      // Round to 3 decimal places
      consumption = Math.round(consumption * 1000) / 1000;

      consumptionData.push({
        time_label: timeLabels[i],
        consumption_m3: consumption,
        device_name: level === 'apartment' ? `Device-${id}` : 
                    level === 'building' ? `Building-${id}-Devices` : 'Multiple Devices',
        building_name: buildingName,
        building_group_name: buildingGroupName,
        device_count: deviceCount
      });
    }

    return consumptionData;
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