import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

@Injectable({
  providedIn: 'root'
})
export class ExcelExportService {

  constructor() { }

  async generateAnalyticsExcel(data: {
    title: string;
    period: { from: string; to: string };
    selection: { type: string; name: string; details?: any };
    consumptionData: any[];
    chartData: any;
    exportData: any;
    buildingGroups: any[];
    buildings: any[];
    apartments: any[];
  }): Promise<void> {
    
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // 1. Summary Sheet
    this.addSummarySheet(workbook, data);
    
    // 2. Consumption Data Sheet
    this.addConsumptionDataSheet(workbook, data);
    
    // 3. Building Groups Sheet
    this.addBuildingGroupsSheet(workbook, data);
    
    // 4. Buildings Sheet
    this.addBuildingsSheet(workbook, data);
    
    // 5. Apartments Sheet
    this.addApartmentsSheet(workbook, data);
    
    // 6. Analytics Sheet
    this.addAnalyticsSheet(workbook, data);
    
    // Generate filename
    const filename = `water-consumption-analytics-${this.formatDateForFilename(data.period.from)}-to-${this.formatDateForFilename(data.period.to)}.xlsx`;
    
    // Save the workbook
    XLSX.writeFile(workbook, filename);
  }

  private addSummarySheet(workbook: XLSX.WorkBook, data: any): void {
    const summaryData = [
      ['WATER CONSUMPTION ANALYTICS REPORT'],
      [''],
      ['Report Information'],
      ['Generated On:', new Date().toLocaleString()],
      ['Report Period:', `${this.formatDate(data.period.from)} to ${this.formatDate(data.period.to)}`],
      ['Analysis Scope:', `${data.selection.type}: ${data.selection.name}`],
      [''],
      ['Consumption Statistics'],
      ['Today', data.exportData.today],
      ['Yesterday', data.exportData.yesterday],
      ['This Week', data.exportData.thisWeek],
      ['This Month', data.exportData.thisMonth],
      ['This Year', data.exportData.thisYear],
      ['Last Year', data.exportData.lastYear],
      [''],
      ['Data Overview'],
      ['Building Groups', data.buildingGroups.length],
      ['Buildings', data.buildings.length],
      ['Apartments', data.apartments.length],
      ['Total Consumption Records', data.consumptionData.length]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Apply styling
    this.applySummaryStyling(worksheet, summaryData.length);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary');
  }

  private addConsumptionDataSheet(workbook: XLSX.WorkBook, data: any): void {
    if (!data.consumptionData || data.consumptionData.length === 0) {
      const emptyData = [['No consumption data available for the selected period']];
      const worksheet = XLSX.utils.aoa_to_sheet(emptyData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Consumption Data');
      return;
    }

    // Prepare consumption data
    const consumptionData = [
      ['Date', 'Consumption (Liters)', 'Period', 'Level', 'Notes']
    ];

    data.consumptionData.forEach((record: any) => {
      consumptionData.push([
        this.formatDate(record.date),
        record.consumption || 0,
        data.selection.type,
        this.getConsumptionLevel(record.consumption),
        this.getConsumptionNotes(record.consumption)
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(consumptionData);
    
    // Apply styling
    this.applyDataTableStyling(worksheet, consumptionData.length);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Consumption Data');
  }

  private addBuildingGroupsSheet(workbook: XLSX.WorkBook, data: any): void {
    const buildingGroupsData = [
      ['Building Group Name', 'Buildings', 'Apartments', 'Devices', 'City', 'Status']
    ];

    data.buildingGroups.forEach((group: any) => {
      buildingGroupsData.push([
        group.name || 'N/A',
        group.buildingCount || 0,
        group.apartmentCount || 0,
        group.deviceCount || 0,
        group.city || 'N/A',
        this.getGroupStatus(group)
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(buildingGroupsData);
    this.applyDataTableStyling(worksheet, buildingGroupsData.length);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Building Groups');
  }

  private addBuildingsSheet(workbook: XLSX.WorkBook, data: any): void {
    const buildingsData = [
      ['Building Name', 'Group', 'Apartments', 'Devices', 'City', 'Zip Code', 'Status', 'Efficiency']
    ];

    data.buildings.forEach((building: any) => {
      buildingsData.push([
        building.name || 'N/A',
        building.buildingGroup || 'N/A',
        building.apartmentCount || 0,
        building.deviceCount || 0,
        building.city || 'N/A',
        building.zipCode || 'N/A',
        this.getBuildingStatus(building),
        this.getBuildingEfficiency(building)
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(buildingsData);
    this.applyDataTableStyling(worksheet, buildingsData.length);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Buildings');
  }

  private addApartmentsSheet(workbook: XLSX.WorkBook, data: any): void {
    const apartmentsData = [
      ['Apartment', 'Tenant', 'Type', 'Building', 'Group', 'Floor', 'Area (m²)', 'Status']
    ];

    data.apartments.forEach((apartment: any) => {
      apartmentsData.push([
        apartment.apartment || 'N/A',
        apartment.tenant || 'Vacant',
        apartment.type || 'Standard',
        apartment.building || 'N/A',
        apartment.buildingGroup || 'N/A',
        apartment.floor || 'N/A',
        apartment.surface_area || 'N/A',
        this.getApartmentStatus(apartment)
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(apartmentsData);
    this.applyDataTableStyling(worksheet, apartmentsData.length);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Apartments');
  }

  private addAnalyticsSheet(workbook: XLSX.WorkBook, data: any): void {
    const analyticsData = [
      ['ANALYTICS & INSIGHTS'],
      [''],
      ['Consumption Analysis'],
      ['Average Daily Consumption', this.calculateAverageConsumption(data.consumptionData)],
      ['Peak Consumption Day', this.getPeakConsumptionDay(data.consumptionData)],
      ['Lowest Consumption Day', this.getLowestConsumptionDay(data.consumptionData)],
      ['Total Consumption (Period)', this.calculateTotalConsumption(data.consumptionData)],
      [''],
      ['Building Performance'],
      ['Most Efficient Building', this.getMostEfficientBuilding(data.buildings)],
      ['Largest Building', this.getLargestBuilding(data.buildings)],
      ['Average Apartments per Building', this.calculateAverageApartmentsPerBuilding(data.buildings)],
      [''],
      ['Tenant Analysis'],
      ['Occupancy Rate', this.calculateOccupancyRate(data.apartments)],
      ['Most Common Apartment Type', this.getMostCommonApartmentType(data.apartments)],
      ['Average Apartment Size', this.calculateAverageApartmentSize(data.apartments)],
      [''],
      ['System Overview'],
      ['Total Building Groups', data.buildingGroups.length],
      ['Total Buildings', data.buildings.length],
      ['Total Apartments', data.apartments.length],
      ['Total Devices', this.calculateTotalDevices(data.buildings)],
      ['System Efficiency Score', this.calculateSystemEfficiency(data)]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(analyticsData);
    this.applyAnalyticsStyling(worksheet, analyticsData.length);
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Analytics');
  }

  // Styling methods
  private applySummaryStyling(worksheet: XLSX.WorkSheet, rowCount: number): void {
    // Title styling
    if (worksheet['!ref']) {
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      
      // Title row
      if (!worksheet['!rows']) worksheet['!rows'] = [];
      worksheet['!rows'][0] = { hpt: 30 };
      
      // Set column widths
      if (!worksheet['!cols']) worksheet['!cols'] = [];
      worksheet['!cols'][0] = { wch: 25 };
      worksheet['!cols'][1] = { wch: 30 };
    }
  }

  private applyDataTableStyling(worksheet: XLSX.WorkSheet, rowCount: number): void {
    if (worksheet['!ref']) {
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      
      // Header row styling
      if (!worksheet['!rows']) worksheet['!rows'] = [];
      worksheet['!rows'][0] = { hpt: 25 };
      
      // Set column widths
      if (!worksheet['!cols']) worksheet['!cols'] = [];
      for (let i = 0; i < range.e.c + 1; i++) {
        worksheet['!cols'][i] = { wch: 15 };
      }
    }
  }

  private applyAnalyticsStyling(worksheet: XLSX.WorkSheet, rowCount: number): void {
    if (worksheet['!ref']) {
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      
      // Title row
      if (!worksheet['!rows']) worksheet['!rows'] = [];
      worksheet['!rows'][0] = { hpt: 30 };
      
      // Set column widths
      if (!worksheet['!cols']) worksheet['!cols'] = [];
      worksheet['!cols'][0] = { wch: 35 };
      worksheet['!cols'][1] = { wch: 25 };
    }
  }

  // Helper methods for calculations and formatting
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  private formatDateForFilename(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  private getConsumptionLevel(consumption: number): string {
    if (consumption > 200) return 'High';
    if (consumption > 100) return 'Medium';
    return 'Low';
  }

  private getConsumptionNotes(consumption: number): string {
    if (consumption > 200) return 'Above average consumption';
    if (consumption < 50) return 'Below average consumption';
    return 'Normal consumption';
  }

  private getGroupStatus(group: any): string {
    const efficiency = (group.apartmentCount || 0) / Math.max(group.buildingCount || 1, 1);
    if (efficiency > 10) return 'Excellent';
    if (efficiency > 5) return 'Good';
    return 'Average';
  }

  private getBuildingStatus(building: any): string {
    const occupancy = (building.apartmentCount || 0) / Math.max(building.deviceCount || 1, 1);
    if (occupancy > 0.8) return 'Fully Occupied';
    if (occupancy > 0.5) return 'Partially Occupied';
    return 'Low Occupancy';
  }

  private getBuildingEfficiency(building: any): string {
    const efficiency = (building.apartmentCount || 0) / Math.max(building.deviceCount || 1, 1);
    if (efficiency > 0.9) return 'High';
    if (efficiency > 0.7) return 'Medium';
    return 'Low';
  }

  private getApartmentStatus(apartment: any): string {
    if (apartment.tenant && apartment.tenant !== 'Vacant') return 'Occupied';
    return 'Vacant';
  }

  // Analytics calculations
  private calculateAverageConsumption(consumptionData: any[]): string {
    if (!consumptionData || consumptionData.length === 0) return '0 L';
    const total = consumptionData.reduce((sum, record) => sum + (record.consumption || 0), 0);
    const average = total / consumptionData.length;
    return `${average.toFixed(2)} L`;
  }

  private getPeakConsumptionDay(consumptionData: any[]): string {
    if (!consumptionData || consumptionData.length === 0) return 'N/A';
    const peak = consumptionData.reduce((max, record) => 
      (record.consumption || 0) > (max.consumption || 0) ? record : max
    );
    return `${this.formatDate(peak.date)} (${peak.consumption || 0} L)`;
  }

  private getLowestConsumptionDay(consumptionData: any[]): string {
    if (!consumptionData || consumptionData.length === 0) return 'N/A';
    const lowest = consumptionData.reduce((min, record) => 
      (record.consumption || 0) < (min.consumption || 0) ? record : min
    );
    return `${this.formatDate(lowest.date)} (${lowest.consumption || 0} L)`;
  }

  private calculateTotalConsumption(consumptionData: any[]): string {
    if (!consumptionData || consumptionData.length === 0) return '0 L';
    const total = consumptionData.reduce((sum, record) => sum + (record.consumption || 0), 0);
    return `${total.toFixed(2)} L`;
  }

  private getMostEfficientBuilding(buildings: any[]): string {
    if (!buildings || buildings.length === 0) return 'N/A';
    const mostEfficient = buildings.reduce((max, building) => {
      const efficiency = (building.apartmentCount || 0) / Math.max(building.deviceCount || 1, 1);
      const maxEfficiency = (max.apartmentCount || 0) / Math.max(max.deviceCount || 1, 1);
      return efficiency > maxEfficiency ? building : max;
    });
    return mostEfficient.name || 'N/A';
  }

  private getLargestBuilding(buildings: any[]): string {
    if (!buildings || buildings.length === 0) return 'N/A';
    const largest = buildings.reduce((max, building) => 
      (building.apartmentCount || 0) > (max.apartmentCount || 0) ? building : max
    );
    return `${largest.name || 'N/A'} (${largest.apartmentCount || 0} apartments)`;
  }

  private calculateAverageApartmentsPerBuilding(buildings: any[]): string {
    if (!buildings || buildings.length === 0) return '0';
    const total = buildings.reduce((sum, building) => sum + (building.apartmentCount || 0), 0);
    const average = total / buildings.length;
    return average.toFixed(1);
  }

  private calculateOccupancyRate(apartments: any[]): string {
    if (!apartments || apartments.length === 0) return '0%';
    const occupied = apartments.filter(apt => apt.tenant && apt.tenant !== 'Vacant').length;
    const rate = (occupied / apartments.length) * 100;
    return `${rate.toFixed(1)}%`;
  }

  private getMostCommonApartmentType(apartments: any[]): string {
    if (!apartments || apartments.length === 0) return 'N/A';
    const types: { [key: string]: number } = {};
    apartments.forEach(apt => {
      const type = apt.type || 'Unknown';
      types[type] = (types[type] || 0) + 1;
    });
    const mostCommon = Object.keys(types).reduce((a, b) => types[a] > types[b] ? a : b);
    return mostCommon;
  }

  private calculateAverageApartmentSize(apartments: any[]): string {
    if (!apartments || apartments.length === 0) return '0 m²';
    const total = apartments.reduce((sum, apt) => sum + (apt.surface_area || 0), 0);
    const average = total / apartments.length;
    return `${average.toFixed(1)} m²`;
  }

  private calculateTotalDevices(buildings: any[]): number {
    if (!buildings || buildings.length === 0) return 0;
    return buildings.reduce((sum, building) => sum + (building.deviceCount || 0), 0);
  }

  private calculateSystemEfficiency(data: any): string {
    const totalApartments = data.apartments.length;
    const totalDevices = this.calculateTotalDevices(data.buildings);
    const occupancyRate = parseFloat(this.calculateOccupancyRate(data.apartments).replace('%', ''));
    
    if (totalDevices === 0) return 'N/A';
    
    const efficiency = (totalApartments / totalDevices) * (occupancyRate / 100);
    const score = Math.min(efficiency * 100, 100);
    
    if (score > 80) return 'Excellent';
    if (score > 60) return 'Good';
    if (score > 40) return 'Average';
    return 'Needs Improvement';
  }
}
