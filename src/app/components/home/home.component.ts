import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService, Alarm, DailyConsumption, DeviceStatus, MonthlyStats } from '../../services/supabase.service';

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

  // Supabase data properties
  alarms: Alarm[] = [];
  consumptionData: DailyConsumption[] = [];
  deviceStatus: DeviceStatus[] = [];
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

  private async loadData() {
    this.loading = true;
    this.error = null;

    try {
      // Load all data in parallel
      const [alarmsData, consumptionData, deviceStatusData, monthlyStatsData] = await Promise.all([
        this.supabaseService.getAlarms(),
        this.supabaseService.getConsumptionData(),
        this.supabaseService.getDeviceStatus(),
        this.supabaseService.getMonthlyStats()
      ]);

      this.alarms = alarmsData;
      this.consumptionData = consumptionData;
      this.deviceStatus = deviceStatusData;
      this.monthlyStats = monthlyStatsData;

      console.log('Data loaded successfully:', {
        alarms: this.alarms.length,
        consumption: this.consumptionData.length,
        devices: this.deviceStatus.length,
        monthlyStats: this.monthlyStats.length
      });
    } catch (error) {
      console.error('Error loading data:', error);
      this.error = 'Failed to load data from server';
    } finally {
      this.loading = false;
    }
  }

  // Helper methods for template
  getCurrentYear(): number {
    return new Date().getFullYear();
  }

  getCurrentMonth(): string {
    return new Date().toLocaleString('default', { month: 'long' });
  }

  getTenantName(alarm: Alarm): string {
    return alarm.devices?.apartments?.tenants?.first_name + ' ' + alarm.devices?.apartments?.tenants?.last_name || 'N/A';
  }

  showDetails(event: Event) {
    event.stopPropagation();
    this.showNotification('Opening alarm details...');
  }

  hideAlarm(event: Event) {
    event.stopPropagation();
    this.showNotification('Alarm has been hidden');
    
    // Add visual feedback
    const row = (event.target as HTMLElement).closest('tr');
    if (row) {
      (row as HTMLElement).style.opacity = '0.5';
      (row as HTMLElement).style.textDecoration = 'line-through';
    }
  }

  showNotification(message: string) {
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
        backgroundColor: '#7b61ff',
        borderColor: '#7b61ff',
        borderWidth: 2,
        fill: false,
        tension: 0.4
      }]
    };
  }

  // Helper methods for statistics
  getAlarmCount(type: string): number {
    return this.alarms.filter(alarm => alarm.alarm_type === type).length;
  }

  getTotalLeakageAlarms(): number {
    return this.alarms.filter(alarm => 
      alarm.alarm_type === 'major_leak' || 
      alarm.alarm_type === 'medium_leak' || 
      alarm.alarm_type === 'micro_leak'
    ).length;
  }

  getEstimatedLoss(): number {
    // Calculate estimated loss based on alarm data
    return this.alarms.reduce((total, alarm) => {
      if (alarm.estimated_loss_m3) {
        return total + alarm.estimated_loss_m3;
      }
      return total;
    }, 0);
  }

  getWaterSavings(): number {
    // Calculate water savings based on alarm data
    return this.alarms.reduce((total, alarm) => {
      if (alarm.water_savings_m3) {
        return total + alarm.water_savings_m3;
      }
      return total;
    }, 0);
  }

  getCurrentYearConsumption(): number {
    const currentYear = new Date().getFullYear();
    return this.monthlyStats
      .filter(stat => new Date(stat.month).getFullYear() === currentYear)
      .reduce((total, stat) => total + (stat.total_consumption_m3 || 0), 0);
  }

  getPreviousYearConsumption(): number {
    const previousYear = new Date().getFullYear() - 1;
    return this.monthlyStats
      .filter(stat => new Date(stat.month).getFullYear() === previousYear)
      .reduce((total, stat) => total + (stat.total_consumption_m3 || 0), 0);
  }

  getYearlyConsumption(year: number): number {
    return this.monthlyStats
      .filter(stat => new Date(stat.month).getFullYear() === year)
      .reduce((total, stat) => total + (stat.total_consumption_m3 || 0), 0);
  }
}
