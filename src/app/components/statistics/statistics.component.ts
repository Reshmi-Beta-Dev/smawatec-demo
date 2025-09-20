import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

  // Pagination properties for Building Groups
  buildingGroupCurrentPage = 1;
  buildingGroupItemsPerPage = 8;
  buildingGroupTotalItems = 0;
  buildingGroupTotalPages = 0;
  paginatedBuildingGroups: any[] = [];
  allBuildingGroups: any[] = [];

  // Pagination properties for Building
  buildingCurrentPage = 1;
  buildingItemsPerPage = 8;
  buildingTotalItems = 0;
  buildingTotalPages = 0;
  paginatedBuildings: any[] = [];
  allBuildings: any[] = [];

  // Pagination properties for Apartment
  apartmentCurrentPage = 1;
  apartmentItemsPerPage = 8;
  apartmentTotalItems = 0;
  apartmentTotalPages = 0;
  paginatedApartments: any[] = [];
  allApartments: any[] = [];

  // Expose Math object to template
  Math = Math;

  ngOnInit() {
    // Initialize data and pagination
    this.initializeData();
  }

  initializeData() {
    // Initialize Building Groups data
    this.allBuildingGroups = [
      { id: 1, group: 'PAR - GP1', building: 'PAR-GP1-B12012', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place' },
      { id: 2, group: 'PAR - GP1', building: 'PAR-GP1-B12013', zipCode: '23234', address: 'Paris, Champs Elysees, Rue de la Place' },
      { id: 3, group: 'PAR - GP1', building: 'PAR-GP1-B12014', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place' },
      { id: 4, group: 'PAR - GP1', building: 'PAR-GP1-B12015', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place' },
      { id: 5, group: 'PAR - GP1', building: 'PAR-GP1-B12016', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place' },
      { id: 6, group: 'PAR - GP1', building: 'PAR-GP1-B12017', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place' },
      { id: 7, group: 'PAR - GP1', building: 'PAR-GP1-B12018', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place' },
      { id: 8, group: 'PAR - GP1', building: 'PAR-GP1-B12019', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place' },
      { id: 9, group: 'PAR - GP1', building: 'PAR-GP1-B12020', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place' },
      { id: 10, group: 'PAR - GP1', building: 'PAR-GP1-B12021', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place' },
      { id: 11, group: 'PAR - GP1', building: 'PAR-GP1-B12022', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place' },
      { id: 12, group: 'PAR - GP1', building: 'PAR-GP1-B12023', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place' }
    ];

    // Initialize Building data
    this.allBuildings = [
      { id: 1, building: 'PAR-GP1-B12012', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place', apartment: 'Block 1, L23, Ap12', tenant: 'Bonaparte, Napoleon' },
      { id: 2, building: 'PAR-GP1-B12013', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place', apartment: 'Block 1, L24, Ap13', tenant: 'Duc de la Roche, Francois' },
      { id: 3, building: 'PAR-GP1-B12014', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place', apartment: 'Block 2, L25, Ap14', tenant: 'Depardieu, Gerard' },
      { id: 4, building: 'PAR-GP1-B12015', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place', apartment: 'Block 3, L26, Ap15', tenant: 'Vuitton, Luis' },
      { id: 5, building: 'PAR-GP1-B12016', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place', apartment: 'Block 4, L27, Ap16', tenant: 'Dupont, Marie' },
      { id: 6, building: 'PAR-GP1-B12017', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place', apartment: 'Block 5, L28, Ap17', tenant: 'Martin, Pierre' },
      { id: 7, building: 'PAR-GP1-B12018', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place', apartment: 'Block 6, L29, Ap18', tenant: 'Bernard, Sophie' },
      { id: 8, building: 'PAR-GP1-B12019', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place', apartment: 'Block 7, L30, Ap19', tenant: 'Thomas, Jean' },
      { id: 9, building: 'PAR-GP1-B12020', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place', apartment: 'Block 8, L31, Ap20', tenant: 'Petit, Anne' },
      { id: 10, building: 'PAR-GP1-B12021', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place', apartment: 'Block 9, L32, Ap21', tenant: 'Robert, Michel' },
      { id: 11, building: 'PAR-GP1-B12022', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place', apartment: 'Block 10, L33, Ap22', tenant: 'Richard, Claire' },
      { id: 12, building: 'PAR-GP1-B12023', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place', apartment: 'Block 11, L34, Ap23', tenant: 'Durand, Paul' }
    ];

    // Initialize Apartment data
    this.allApartments = [
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

    // Initialize pagination for all grids
    this.updateBuildingGroupPagination();
    this.updateBuildingPagination();
    this.updateApartmentPagination();
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

  // Building Group Pagination Methods
  updateBuildingGroupPagination() {
    this.buildingGroupTotalItems = this.allBuildingGroups.length;
    this.buildingGroupTotalPages = Math.ceil(this.buildingGroupTotalItems / this.buildingGroupItemsPerPage);
    const startIndex = (this.buildingGroupCurrentPage - 1) * this.buildingGroupItemsPerPage;
    const endIndex = startIndex + this.buildingGroupItemsPerPage;
    this.paginatedBuildingGroups = this.allBuildingGroups.slice(startIndex, endIndex);
  }

  goToBuildingGroupPage(page: number) {
    if (page >= 1 && page <= this.buildingGroupTotalPages) {
      this.buildingGroupCurrentPage = page;
      this.updateBuildingGroupPagination();
    }
  }

  nextBuildingGroupPage() {
    if (this.buildingGroupCurrentPage < this.buildingGroupTotalPages) {
      this.goToBuildingGroupPage(this.buildingGroupCurrentPage + 1);
    }
  }

  previousBuildingGroupPage() {
    if (this.buildingGroupCurrentPage > 1) {
      this.goToBuildingGroupPage(this.buildingGroupCurrentPage - 1);
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

  // Building Pagination Methods
  updateBuildingPagination() {
    this.buildingTotalItems = this.allBuildings.length;
    this.buildingTotalPages = Math.ceil(this.buildingTotalItems / this.buildingItemsPerPage);
    const startIndex = (this.buildingCurrentPage - 1) * this.buildingItemsPerPage;
    const endIndex = startIndex + this.buildingItemsPerPage;
    this.paginatedBuildings = this.allBuildings.slice(startIndex, endIndex);
  }

  goToBuildingPage(page: number) {
    if (page >= 1 && page <= this.buildingTotalPages) {
      this.buildingCurrentPage = page;
      this.updateBuildingPagination();
    }
  }

  nextBuildingPage() {
    if (this.buildingCurrentPage < this.buildingTotalPages) {
      this.goToBuildingPage(this.buildingCurrentPage + 1);
    }
  }

  previousBuildingPage() {
    if (this.buildingCurrentPage > 1) {
      this.goToBuildingPage(this.buildingCurrentPage - 1);
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
