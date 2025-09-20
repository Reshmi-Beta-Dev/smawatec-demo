import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseStatisticsService, BuildingGroup, Building, Apartment } from '../../services/supabase-statistics.service';

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

  // Expose Math object to template
  Math = Math;

  constructor(private supabaseStatisticsService: SupabaseStatisticsService) {}

  ngOnInit() {
    // Load data from Supabase
    this.loadData();
  }

  async loadData() {
    this.loading = true;
    this.error = null;

    try {
      // Load building groups from Supabase
      await this.loadBuildingGroups();
      
      // Load buildings and apartments (still using hardcoded data for now)
      await this.loadBuildings();
      await this.loadApartments();
      
      console.log('✅ All data loaded successfully');
    } catch (error: any) {
      console.error('❌ Error loading data:', error);
      this.error = `Failed to load data: ${error.message}`;
    } finally {
      this.loading = false;
    }
  }

  async loadBuildingGroups() {
    try {
      const response = await this.supabaseStatisticsService.getBuildingGroups(
        this.buildingGroupCurrentPage,
        this.buildingGroupItemsPerPage
      );
      
      this.paginatedBuildingGroups = response.building_groups;
      this.buildingGroupTotalItems = response.total_count;
      this.buildingGroupTotalPages = response.total_pages;
      
      console.log('✅ Building groups loaded:', response.building_groups.length, 'items');
    } catch (error: any) {
      console.error('❌ Error loading building groups:', error);
      throw error;
    }
  }

  async loadBuildings() {
    try {
      const response = await this.supabaseStatisticsService.getBuildings(
        this.buildingCurrentPage,
        this.buildingItemsPerPage
      );
      
      this.paginatedBuildings = response.buildings;
      this.buildingTotalItems = response.total_count;
      this.buildingTotalPages = response.total_pages;
      
      console.log('✅ Buildings loaded:', response.buildings.length, 'items');
    } catch (error: any) {
      console.error('❌ Error loading buildings:', error);
      throw error;
    }
  }

  async loadApartments() {
    try {
      this.allApartments = await this.supabaseStatisticsService.getApartments();
      this.updateApartmentPagination();
      console.log('✅ Apartments loaded:', this.allApartments.length, 'items');
    } catch (error: any) {
      console.error('❌ Error loading apartments:', error);
      throw error;
    }
  }

  ngAfterViewInit() {
    // Initialize chart after view is ready
    setTimeout(() => {
      this.initializeChart();
    }, 500);
  }

  ngOnDestroy() {
    // Clean up chart when component is destroyed
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  onBuildingGroupRowClick(index: number) {
    this.selectedBuildingGroupRow = this.selectedBuildingGroupRow === index ? null : index;
  }

  onBuildingRowClick(index: number) {
    this.selectedBuildingRow = this.selectedBuildingRow === index ? null : index;
  }

  onApartmentRowClick(index: number) {
    this.selectedApartmentRow = this.selectedApartmentRow === index ? null : index;
  }

  // Building Group Pagination Methods (now using server-side pagination)
  async goToBuildingGroupPage(page: number) {
    if (page >= 1 && page <= this.buildingGroupTotalPages) {
      this.buildingGroupCurrentPage = page;
      await this.loadBuildingGroups();
    }
  }

  async nextBuildingGroupPage() {
    if (this.buildingGroupCurrentPage < this.buildingGroupTotalPages) {
      await this.goToBuildingGroupPage(this.buildingGroupCurrentPage + 1);
    }
  }

  async previousBuildingGroupPage() {
    if (this.buildingGroupCurrentPage > 1) {
      await this.goToBuildingGroupPage(this.buildingGroupCurrentPage - 1);
    }
  }

  getBuildingGroupPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.buildingGroupCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.buildingGroupTotalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Building Pagination Methods (now using server-side pagination)
  async goToBuildingPage(page: number) {
    if (page >= 1 && page <= this.buildingTotalPages) {
      this.buildingCurrentPage = page;
      await this.loadBuildings();
    }
  }

  async nextBuildingPage() {
    if (this.buildingCurrentPage < this.buildingTotalPages) {
      await this.goToBuildingPage(this.buildingCurrentPage + 1);
    }
  }

  async previousBuildingPage() {
    if (this.buildingCurrentPage > 1) {
      await this.goToBuildingPage(this.buildingCurrentPage - 1);
    }
  }

  getBuildingPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.buildingCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.buildingTotalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Apartment Pagination Methods
  updateApartmentPagination() {
    this.apartmentTotalItems = this.allApartments.length;
    this.apartmentTotalPages = Math.ceil(this.apartmentTotalItems / this.apartmentItemsPerPage);
    const startIndex = (this.apartmentCurrentPage - 1) * this.apartmentItemsPerPage;
    const endIndex = startIndex + this.apartmentItemsPerPage;
    this.paginatedApartments = this.allApartments.slice(startIndex, endIndex);
  }

  goToApartmentPage(page: number) {
    if (page >= 1 && page <= this.apartmentTotalPages) {
      this.apartmentCurrentPage = page;
      this.updateApartmentPagination();
    }
  }

  nextApartmentPage() {
    if (this.apartmentCurrentPage < this.apartmentTotalPages) {
      this.goToApartmentPage(this.apartmentCurrentPage + 1);
    }
  }

  previousApartmentPage() {
    if (this.apartmentCurrentPage > 1) {
      this.goToApartmentPage(this.apartmentCurrentPage - 1);
    }
  }

  getApartmentPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.apartmentCurrentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.apartmentTotalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  previousPeriod() {
    this.showNotification('Previous period navigation');
    // Reinitialize chart after navigation
    setTimeout(() => {
      this.initializeChart();
    }, 100);
  }

  nextPeriod() {
    this.showNotification('Next period navigation');
    // Reinitialize chart after navigation
    setTimeout(() => {
      this.initializeChart();
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

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get 2D context');
      return;
    }

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    // Sample data based on the image (peaks around hour 7 and 20)
    const chartData = {
      labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 
              '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'],
      datasets: [{
        label: 'Water Usage (Liters)',
        data: [20, 15, 10, 25, 30, 45, 130, 110, 80, 60, 50, 45, 
               40, 35, 30, 25, 40, 60, 80, 120, 100, 70, 50, 30],
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        borderWidth: 0,
        borderRadius: 4,
        borderSkipped: false,
      }]
    };

    try {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 0 // Disable animation to prevent flickering
          },
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              grid: {
                display: false
              },
              ticks: {
                color: '#666',
                font: {
                  size: 11
                }
              }
            },
            y: {
              beginAtZero: true,
              max: 160,
              ticks: {
                stepSize: 20,
                color: '#666',
                font: {
                  size: 11
                }
              },
              grid: {
                color: '#e0e0e0',
                lineWidth: 1
              }
            }
          },
          elements: {
            bar: {
              borderRadius: 4
            }
          }
        }
      });
      console.log('Chart initialized successfully');
    } catch (error) {
      console.error('Error initializing chart:', error);
    }
  }

  private showNotification(message: string) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #7b61ff;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}
