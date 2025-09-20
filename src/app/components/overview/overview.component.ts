import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService, MonthlyStats } from '../../services/supabase.service';

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

  // Supabase data properties
  monthlyStats: MonthlyStats[] = [];
  loading = false;
  error: string | null = null;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadData();
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

  private initializeChart() {
    // Check if Chart is available
    if (typeof Chart === 'undefined') {
      console.error('Chart.js is not loaded');
      return;
    }

    const canvas = document.getElementById('consumptionChart') as HTMLCanvasElement;
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

    // Process monthly data from Supabase
    const chartData = this.processMonthlyDataForChart();

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
    } catch (error) {
      console.error('Error initializing consumption chart:', error);
    }
  }

  private async loadData() {
    this.loading = true;
    this.error = null;

    try {
      this.monthlyStats = await this.supabaseService.getMonthlyStats();
    } catch (error) {
      console.error('Error loading overview data:', error);
      this.error = 'Failed to load data from server';
    } finally {
      this.loading = false;
    }
  }

  private processMonthlyDataForChart() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const monthlyData = new Array(12).fill(0);

    // Process monthly stats data
    this.monthlyStats.forEach(stat => {
      const statDate = new Date(stat.month);
      if (statDate.getFullYear() === currentYear) {
        const monthIndex = statDate.getMonth();
        monthlyData[monthIndex] = stat.total_consumption_m3 || 0;
      }
    });

    return {
      labels: months,
      datasets: [{
        label: 'Water Consumption (m³)',
        data: monthlyData,
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      }]
    };
  }
}
