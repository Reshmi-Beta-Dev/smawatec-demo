import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

declare var Chart: any;

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatDividerModule,
    MatSnackBarModule
  ],
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedBuildingGroupRow: number | null = null;
  selectedBuildingRow: number | null = null;
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

  // Table data for Material Design tables
  buildingGroupColumns: string[] = ['id', 'group', 'building', 'zipCode', 'address'];
  buildingGroupData = [
    { id: 1, group: 'PAR - GP1', building: 'PAR-GP1-B12012', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place' },
    { id: 2, group: 'PAR - GP1', building: 'PAR-GP1-B12012', zipCode: '23234', address: 'Paris, Champs Elysees, Rue de la Place' },
    { id: 3, group: 'PAR - GP1', building: 'PAR-GP1-B12012', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place' },
    { id: 4, group: 'PAR - GP1', building: 'PAR-GP1-B12012', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place' },
    { id: 5, group: 'PAR - GP1', building: 'PAR-GP1-B12012', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place' },
    { id: 6, group: 'PAR - GP1', building: 'PAR-GP1-B12012', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place' },
    { id: 7, group: 'PAR - GP1', building: 'PAR-GP1-B12012', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place' },
    { id: 8, group: 'PAR - GP1', building: 'PAR-GP1-B12012', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place' }
  ];

  buildingColumns: string[] = ['id', 'building', 'zipCode', 'address', 'apartment', 'tenant'];
  buildingData = [
    { id: 1, building: 'PAR-GP1-B12012', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place', apartment: 'Block 1, L23, Ap12', tenant: 'Bonaparte, Napoleon' },
    { id: 2, building: 'PAR-GP1-B12012', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place', apartment: 'Block 1, L23, Ap12', tenant: 'Bonaparte, Napoleon' },
    { id: 3, building: 'PAR-GP1-B12012', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place', apartment: 'Block 1, L23, Ap12', tenant: 'Bonaparte, Napoleon' },
    { id: 4, building: 'PAR-GP1-B12012', zipCode: '23212', address: 'Paris, Champs Elysees, Rue de la Place', apartment: 'Block 1, L23, Ap12', tenant: 'Bonaparte, Napoleon' }
  ];

  // Statistics data
  statisticsData = [
    { label: 'Today:', value: '123 Liter', icon: 'today' },
    { label: 'Yesterday:', value: '230 Liter', icon: 'yesterday' },
    { label: 'This week:', value: '899 Liter', icon: 'date_range' },
    { label: 'This Month:', value: '22 m³', icon: 'calendar_month' },
    { label: 'This Year:', value: '342m³', icon: 'calendar_today' },
    { label: 'Last year:', value: '388m³', icon: 'history' }
  ];

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit() {
    // Initialize any component logic here
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

  previousPeriod() {
    this.snackBar.open('Previous period navigation', 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
    // Reinitialize chart after navigation
    setTimeout(() => {
      this.initializeChart();
    }, 100);
  }

  nextPeriod() {
    this.snackBar.open('Next period navigation', 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
    // Reinitialize chart after navigation
    setTimeout(() => {
      this.initializeChart();
    }, 100);
  }

  resetPeriod() {
    this.periodFrom = '';
    this.periodTo = '';
    this.snackBar.open('Period has been reset to default', 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  exportPDF() {
    this.snackBar.open('PDF export functionality would generate a PDF report', 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  exportXLS() {
    this.snackBar.open('Excel export functionality would generate an Excel file', 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
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
        backgroundColor: '#7b61ff',
        borderColor: '#7b61ff',
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

}
