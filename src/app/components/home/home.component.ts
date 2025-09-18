import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';

declare var Chart: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatDividerModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedRow: number | null = null;
  showOverview: boolean = true; // Toggle between overview and home content
  private chart: any;

  // Table data for Material Design table
  displayedColumns: string[] = ['id', 'building', 'address', 'apartment', 'tenant', 'alarm', 'message', 'action', 'actions'];
  alarmData = [
    {
      id: 1,
      building: 'PAR - B12012',
      address: 'Paris, Champs Elysees, Rue de la P',
      apartment: 'Block 1,L23, Apt 12',
      tenant: 'Duvall',
      alarm: { type: 'Major Leak', severity: 'major' },
      message: 'poss. Pipe break',
      action: 'auto shut off'
    },
    {
      id: 2,
      building: 'PAR - B12012',
      address: 'Paris, Champs Elysees, Rue de la P',
      apartment: 'Block 1,L23, Apt 12',
      tenant: 'Duvall',
      alarm: { type: 'Low Temp', severity: 'low-temp' },
      message: 'Ice warning',
      action: 'None'
    },
    {
      id: 3,
      building: 'PAR - B12012',
      address: 'Paris, Champs Elysees, Rue de la P',
      apartment: 'Block 1,L23, Apt 12',
      tenant: 'Duvall',
      alarm: { type: 'Medium Leak', severity: 'medium' },
      message: 'poss. Tap / Toilet',
      action: 'None'
    },
    {
      id: 4,
      building: 'PAR - B12012',
      address: 'Paris, Champs Elysees, Rue de la P',
      apartment: 'Block 1,L23, Apt 12',
      tenant: 'Duvall',
      alarm: { type: 'Micro Leak', severity: 'micro' },
      message: 'poss. Toilet',
      action: 'None'
    },
    {
      id: 5,
      building: 'PAR - B12012',
      address: 'Paris, Champs Elysees, Rue de la P',
      apartment: 'Block 1,L23, Apt 12',
      tenant: 'Duvall',
      alarm: { type: 'Micro Leak', severity: 'micro' },
      message: 'poss. Toilet',
      action: 'None'
    },
    {
      id: 6,
      building: 'PAR - B12012',
      address: 'Paris, Champs Elysees, Rue de la P',
      apartment: 'Block 1,L23, Apt 12',
      tenant: 'Duvall',
      alarm: { type: 'Micro Leak', severity: 'micro' },
      message: 'poss. Tap',
      action: 'None'
    },
    {
      id: 7,
      building: 'PAR - B12012',
      address: 'Paris, Champs Elysees, Rue de la P',
      apartment: 'Block 1,L23, Apt 12',
      tenant: 'Duvall',
      alarm: { type: 'Micro Leak', severity: 'micro' },
      message: 'poss. Tap',
      action: 'None'
    },
    {
      id: 8,
      building: 'PAR - B12012',
      address: 'Paris, Champs Elysees, Rue de la P',
      apartment: 'Block 1,L23, Apt 12',
      tenant: 'Duvall',
      alarm: { type: 'Micro Leak', severity: 'micro' },
      message: 'poss. Tap',
      action: 'None'
    }
  ];

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

  onRowClick(index: number) {
    this.selectedRow = this.selectedRow === index ? null : index;
  }

  toggleView() {
    this.showOverview = !this.showOverview;
  }

  private initializeChart() {
    // Check if Chart is available
    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded');
      return;
    }

    const canvas = document.getElementById('monthlyChart') as HTMLCanvasElement;
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

    // Sample monthly data for 2025
    const chartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Water Consumption (m³)',
        data: [32000, 28000, 35000, 42000, 38000, 45000, 48000, 52000, 46000, 40000, 36000, 33000],
        backgroundColor: '#7b61ff',
        borderColor: '#7b61ff',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      }]
    };

    try {
      this.chart = new Chart(ctx, {
        type: 'line',
        data: chartData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 0
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
              ticks: {
                color: '#666',
                font: {
                  size: 11
                },
                callback: function(value: any) {
                  return value + 'k';
                }
              },
              grid: {
                color: '#e0e0e0',
                lineWidth: 1
              }
            }
          }
        }
      });
      console.log('Monthly chart initialized successfully');
    } catch (error) {
      console.error('Error initializing monthly chart:', error);
    }
  }
}
