import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../services/mock-data.service';

declare var Chart: any;

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.css']
})
export class OverviewComponent implements OnInit, AfterViewInit, OnDestroy {
  selectedRow: number | null = null;
  private chart: any;

  // Mock data properties
  monthlyStats: any[] = [];
  loading = false;
  error: string | null = null;

  constructor(private mockDataService: MockDataService) {}

  async ngOnInit() {
    await this.loadData();
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

  private async loadData() {
    try {
      this.loading = true;
      this.error = null;

      // Mock monthly stats data
      this.monthlyStats = [
        { month: 'January', consumption: 1200.5, alarms: 3 },
        { month: 'February', consumption: 1350.2, alarms: 5 },
        { month: 'March', consumption: 1180.8, alarms: 2 },
        { month: 'April', consumption: 1420.9, alarms: 4 },
        { month: 'May', consumption: 1280.3, alarms: 1 },
        { month: 'June', consumption: 1550.7, alarms: 6 }
      ];

    } catch (error) {
      console.error('Error loading data:', error);
      this.error = 'Failed to load overview data';
    } finally {
      this.loading = false;
    }
  }

  onRowClick(index: number) {
    this.selectedRow = this.selectedRow === index ? null : index;
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

    const chartData = this.processMonthlyDataForChart();

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: 'Monthly Water Consumption (L)',
          data: chartData.data,
          backgroundColor: 'rgba(123, 97, 255, 0.6)',
          borderColor: '#7b61ff',
          borderWidth: 1
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
              text: 'Consumption (Liters)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Month'
            }
          }
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        }
      }
    });
  }

  private processMonthlyDataForChart() {
    if (!this.monthlyStats || this.monthlyStats.length === 0) {
      return { data: [], labels: [] };
    }

    const labels = this.monthlyStats.map(item => item.month);
    const data = this.monthlyStats.map(item => item.consumption);

    return { data, labels };
  }
}