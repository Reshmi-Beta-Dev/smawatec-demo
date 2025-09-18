import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

declare var Chart: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedRow: number | null = null;
  showOverview: boolean = true; // Toggle between overview and home content
  private chart: any;
  private chartCheckInterval: any;

  ngOnInit() {
    // Initialize any component logic here
  }

  ngAfterViewInit() {
    // Initialize chart after view is ready
    setTimeout(() => {
      this.initializeChart();
    }, 1000); // Increased timeout to ensure Chart.js is fully loaded
    
    // Check chart visibility every 2 seconds
    this.chartCheckInterval = setInterval(() => {
      this.checkChartVisibility();
    }, 2000);
  }

  ngOnDestroy() {
    // Clean up chart when component is destroyed
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
    
    // Clear interval
    if (this.chartCheckInterval) {
      clearInterval(this.chartCheckInterval);
    }
  }

  onRowClick(index: number) {
    this.selectedRow = this.selectedRow === index ? null : index;
  }

  toggleView() {
    this.showOverview = !this.showOverview;
    // Reinitialize chart after view toggle
    if (this.showOverview) {
      setTimeout(() => {
        this.initializeChart();
      }, 100);
    }
  }

  private initializeChart() {
    // Check if Chart is available
    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded, retrying in 500ms...');
      setTimeout(() => {
        this.initializeChart();
      }, 500);
      return;
    }

    const canvas = document.getElementById('monthlyChart') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Canvas element not found, retrying in 500ms...');
      setTimeout(() => {
        this.initializeChart();
      }, 500);
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
      this.chart = null;
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
          interaction: {
            intersect: false,
            mode: 'index'
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

  private checkChartVisibility() {
    const canvas = document.getElementById('monthlyChart') as HTMLCanvasElement;
    if (canvas && this.showOverview) {
      // Check if chart exists and canvas is visible
      if (!this.chart || this.chart.canvas.width === 0 || this.chart.canvas.height === 0) {
        console.log('Chart not visible, reinitializing...');
        this.initializeChart();
      }
    }
  }
}
