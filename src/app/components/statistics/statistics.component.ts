import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService, DailyConsumption, BuildingGroup, Building, Apartment } from '../../services/mock-data.service';

declare var Chart: any;

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedBuildingGroupRow: number | null = null;
  selectedBuildingRow: number | null = null;
  selectedApartmentRow: number | null = null;
  searchData: any = {
    keyword: '',
    building: '',
    buildingGroup: '',
    deviceName: '',
    city: '',
    zipCode: '',
    tenant: '',
    tenantId: ''
  };
  periodFrom: string = '';
  periodTo: string = '';
  private chart: any;

  // Loading and error states
  loading = false;
  error: string | null = null;

  // Pagination properties for Building Groups
  buildingGroupCurrentPage = 1;
  buildingGroupItemsPerPage = 8;
  buildingGroupTotalItems = 0;
  buildingGroupTotalPages = 0;
  paginatedBuildingGroups: BuildingGroup[] = [];
  allBuildingGroups: BuildingGroup[] = [];

  // Pagination properties for Building
  buildingCurrentPage = 1;
  buildingItemsPerPage = 8;
  buildingTotalItems = 0;
  buildingTotalPages = 0;
  paginatedBuildings: Building[] = [];
  allBuildings: Building[] = [];

  // Pagination properties for Apartment
  apartmentCurrentPage = 1;
  apartmentItemsPerPage = 8;
  apartmentTotalItems = 0;
  apartmentTotalPages = 0;
  paginatedApartments: Apartment[] = [];
  allApartments: Apartment[] = [];

  // Consumption data and controls
  consumptionData: any[] = [];
  timePeriods: any[] = [];
  chartTypes: any[] = [];
  selectedTimePeriod = 'today';
  selectedChartType = 'hourly';
  selectedApartmentId: string | null = null;
  selectedBuildingId: string | null = null;
  selectedBuildingGroupName: string | null = null;

  constructor(private mockDataService: MockDataService) {}

  ngOnInit() {
    this.loadTimePeriods();
    this.loadChartTypes();
    this.loadBuildingGroups();
    this.loadBuildings();
    this.loadApartments();
    this.loadConsumptionData();
  }

  ngAfterViewInit() {
    // Initialize chart after view is ready
    setTimeout(() => {
      this.initializeChart();
    }, 100);
  }

  ngOnDestroy() {
    // Clean up chart when component is destroyed
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  // Building Group methods
  async loadBuildingGroups() {
    try {
      this.loading = true;
      const response = await this.mockDataService.getBuildingGroups(this.buildingGroupCurrentPage, this.buildingGroupItemsPerPage);
      this.paginatedBuildingGroups = response.buildingGroups;
      this.buildingGroupTotalItems = response.totalCount;
      this.buildingGroupTotalPages = response.totalPages;
    } catch (error) {
      console.error('Error loading building groups:', error);
      this.error = 'Failed to load building groups';
    } finally {
      this.loading = false;
    }
  }

  onBuildingGroupRowClick(index: number) {
    this.selectedBuildingGroupRow = this.selectedBuildingGroupRow === index ? null : index;
    this.selectedBuildingRow = null;
    this.selectedApartmentRow = null;
    
    if (this.selectedBuildingGroupRow !== null) {
      const buildingGroup = this.paginatedBuildingGroups[index];
      this.selectedBuildingGroupName = buildingGroup.group || null;
      this.selectedBuildingId = null;
      this.selectedApartmentId = null;
      // Load buildings for this group
      this.loadBuildingsForGroup(buildingGroup.id);
      this.loadConsumptionData();
    } else {
      // Load all buildings when no group selected
      this.loadBuildings();
      this.loadConsumptionData();
    }
  }

  onBuildingGroupPageChange(page: number) {
    this.buildingGroupCurrentPage = page;
    this.loadBuildingGroups();
  }

  // Building methods
  async loadBuildings() {
    try {
      this.loading = true;
      const response = await this.mockDataService.getBuildings(this.buildingCurrentPage, this.buildingItemsPerPage);
      this.paginatedBuildings = response.buildings;
      this.buildingTotalItems = response.totalCount;
      this.buildingTotalPages = response.totalPages;
    } catch (error) {
      console.error('Error loading buildings:', error);
      this.error = 'Failed to load buildings';
    } finally {
      this.loading = false;
    }
  }

  onBuildingRowClick(index: number) {
    this.selectedBuildingRow = this.selectedBuildingRow === index ? null : index;
    this.selectedApartmentRow = null;
    
    if (this.selectedBuildingRow !== null) {
      const building = this.paginatedBuildings[index];
      this.selectedBuildingId = building.id?.toString() || null;
      this.selectedApartmentId = null;
      // Load apartments for this building
      this.loadApartmentsForBuilding(building.id?.toString() || '');
      this.loadConsumptionData();
    } else {
      // Load all apartments when no building selected
      this.loadApartments();
      this.loadConsumptionData();
    }
  }

  onBuildingPageChange(page: number) {
    this.buildingCurrentPage = page;
    this.loadBuildings();
  }

  // Apartment methods
  async loadApartments() {
    try {
      this.loading = true;
      const response = await this.mockDataService.getApartments(this.apartmentCurrentPage, this.apartmentItemsPerPage);
      this.paginatedApartments = response.apartments;
      this.apartmentTotalItems = response.totalCount;
      this.apartmentTotalPages = response.totalPages;
    } catch (error) {
      console.error('Error loading apartments:', error);
      this.error = 'Failed to load apartments';
    } finally {
      this.loading = false;
    }
  }

  onApartmentRowClick(index: number) {
    this.selectedApartmentRow = this.selectedApartmentRow === index ? null : index;
    
    if (this.selectedApartmentRow !== null) {
      const apartment = this.paginatedApartments[index];
      this.selectedApartmentId = apartment.id?.toString() || null;
      this.loadConsumptionData();
    } else {
      this.loadConsumptionData();
    }
  }

  onApartmentPageChange(page: number) {
    this.apartmentCurrentPage = page;
    this.loadApartments();
  }

  // Load buildings for a specific group
  async loadBuildingsForGroup(buildingGroupId: string) {
    try {
      this.loading = true;
      const buildings = await this.mockDataService.getBuildingsByGroup(buildingGroupId);
      this.paginatedBuildings = buildings;
      this.allBuildings = buildings;
      this.buildingTotalItems = buildings.length;
      this.buildingTotalPages = Math.ceil(buildings.length / this.buildingItemsPerPage);
      this.buildingCurrentPage = 1;
    } catch (error) {
      console.error('Error loading buildings for group:', error);
      this.error = 'Failed to load buildings for group';
    } finally {
      this.loading = false;
    }
  }

  // Load apartments for a specific building
  async loadApartmentsForBuilding(buildingId: string) {
    try {
      this.loading = true;
      const apartments = await this.mockDataService.getApartmentsByBuilding(buildingId);
      this.paginatedApartments = apartments;
      this.allApartments = apartments;
      this.apartmentTotalItems = apartments.length;
      this.apartmentTotalPages = Math.ceil(apartments.length / this.apartmentItemsPerPage);
      this.apartmentCurrentPage = 1;
    } catch (error) {
      console.error('Error loading apartments for building:', error);
      this.error = 'Failed to load apartments for building';
    } finally {
      this.loading = false;
    }
  }

  // Consumption methods
  async loadTimePeriods() {
    this.timePeriods = await this.mockDataService.getTimePeriods();
  }

  async loadChartTypes() {
    this.chartTypes = await this.mockDataService.getChartTypes();
  }

  async loadConsumptionData() {
    try {
      console.log('🔄 Loading consumption data...', {
        apartment: this.selectedApartmentId,
        building: this.selectedBuildingId,
        group: this.selectedBuildingGroupName,
        period: this.selectedTimePeriod,
        chart: this.selectedChartType
      });

      let data: any[] = [];

      if (this.selectedApartmentId) {
        // Show apartment consumption
        data = await this.mockDataService.getConsumptionByApartment(
          this.selectedTimePeriod,
          this.selectedApartmentId,
          this.selectedChartType
        );
        console.log('✅ Apartment consumption loaded:', data.length, 'records');
      } else if (this.selectedBuildingId) {
        // Show building consumption (sum of all apartments in building)
        data = await this.mockDataService.getConsumptionByBuilding(
          this.selectedTimePeriod,
          this.selectedBuildingId,
          this.selectedChartType
        );
        console.log('✅ Building consumption loaded:', data.length, 'records');
      } else if (this.selectedBuildingGroupName) {
        // Show building group consumption (sum of all buildings in group)
        data = await this.mockDataService.getConsumptionByBuildingGroup(
          this.selectedTimePeriod,
          this.selectedBuildingGroupName,
          this.selectedChartType
        );
        console.log('✅ Building group consumption loaded:', data.length, 'records');
      } else {
        // Show all building groups consumption
        data = await this.mockDataService.getConsumptionByBuildingGroup(
          this.selectedTimePeriod,
          '',
          this.selectedChartType
        );
        console.log('✅ All building groups consumption loaded:', data.length, 'records');
      }

      this.consumptionData = data;
      this.updateChart();
    } catch (error: any) {
      console.error('❌ Error loading consumption data:', error);
      this.error = `Failed to load consumption data: ${error.message}`;
    }
  }

  onTimePeriodChange() {
    this.loadConsumptionData();
  }

  onChartTypeChange() {
    this.loadConsumptionData();
  }

  // Chart methods
  private initializeChart() {
    // Check if Chart is available
    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded');
      return;
    }

    const canvas = document.getElementById('waterChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element not found');
      return;
    }

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Water Consumption (m³)',
          data: [],
          borderColor: '#7b61ff',
          backgroundColor: 'rgba(123, 97, 255, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Consumption (m³)'
            }
          },
          x: {
            title: {
              display: true,
              text: this.getTimeAxisLabel()
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        }
      }
    });

    this.updateChart();
  }

  private updateChart() {
    if (!this.chart) return;

    const labels = this.consumptionData.map(item => item.time_label);
    const data = this.consumptionData.map(item => item.consumption_m3);

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.data.datasets[0].label = this.getChartLabel();
    this.chart.options.scales.x.title.text = this.getTimeAxisLabel();
    this.chart.update();
  }

  getTimeAxisLabel(): string {
    switch (this.selectedChartType) {
      case 'hourly': return 'Hour';
      case 'daily': return 'Day';
      case 'monthly': return 'Month';
      case 'yearly': return 'Year';
      default: return 'Time';
    }
  }

  getChartLabel(): string {
    if (this.selectedApartmentId) {
      return 'Apartment Consumption';
    } else if (this.selectedBuildingId) {
      return 'Building Consumption';
    } else if (this.selectedBuildingGroupName) {
      return `Building Group: ${this.selectedBuildingGroupName}`;
    } else {
      return 'All Building Groups Consumption';
    }
  }

  // Utility methods
  showNotification(message: string) {
    console.log('Notification:', message);
    // You can implement a proper notification system here
  }

  // Legacy methods for compatibility
  async previousPeriod() {
    this.showNotification('Previous period navigation');
    await this.loadConsumptionData();
    setTimeout(() => {
      this.updateChart();
    }, 100);
  }

  async nextPeriod() {
    this.showNotification('Next period navigation');
    await this.loadConsumptionData();
    setTimeout(() => {
      this.updateChart();
    }, 100);
  }

  resetPeriod() {
    this.periodFrom = '';
    this.periodTo = '';
    this.showNotification('Period has been reset to default');
  }

  exportPDF() {
    this.showNotification('PDF export functionality would generate a PDF report');
  }

  exportXLS() {
    this.showNotification('Excel export functionality would generate an Excel file');
  }

  // Pagination helper methods
  getBuildingGroupPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.buildingGroupCurrentPage - 2);
    const endPage = Math.min(this.buildingGroupTotalPages, this.buildingGroupCurrentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getBuildingPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.buildingCurrentPage - 2);
    const endPage = Math.min(this.buildingTotalPages, this.buildingCurrentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getApartmentPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.apartmentCurrentPage - 2);
    const endPage = Math.min(this.apartmentTotalPages, this.apartmentCurrentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Math object for template
  Math = Math;
}