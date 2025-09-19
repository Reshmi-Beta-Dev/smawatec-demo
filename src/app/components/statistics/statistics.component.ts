import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService, DailyConsumption } from '../../services/supabase.service';

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

  // Supabase data properties
  consumptionData: DailyConsumption[] = [];
  loading = false;
  error: string | null = null;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadTodaysData();
  }

  async ngAfterViewInit() {
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

  async previousPeriod() {
    this.showNotification('Previous period navigation');
    await this.loadTodaysData();
    // Reinitialize chart after navigation
    setTimeout(() => {
      this.initializeChart();
    }, 100);
  }

  async nextPeriod() {
    this.showNotification('Next period navigation');
    await this.loadTodaysData();
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

  private async loadTodaysData() {
    try {
      this.loading = true;
      this.error = null;

      const today = new Date().toISOString().split('T')[0];
      console.log('Loading today\'s data for:', today);

      this.consumptionData = await this.supabaseService.getDailyConsumption(
        undefined, // All devices
        today,
        today
      );

      console.log('Received today\'s consumption data:', {
        count: this.consumptionData.length,
        sample: this.consumptionData.slice(0, 3)
      });

    } catch (error) {
      console.error('Error loading today\'s data:', error);
      this.error = 'Failed to load today\'s consumption data.';
    } finally {
      this.loading = false;
    }
  }

  private processTodaysDataForChart() {
    // Group by device for today's view (since we only have daily totals, not hourly)
    const deviceData = new Map<string, number>();
    
    this.consumptionData.forEach(data => {
      const deviceKey = data.serial_number;
      deviceData.set(deviceKey, (deviceData.get(deviceKey) || 0) + (data.consumption_liters || 0));
    });

    console.log('Device consumption data:', Object.fromEntries(deviceData));

    // Convert to array and sort by consumption descending
    const sortedDevices = Array.from(deviceData.entries())
      .sort(([,a], [,b]) => b - a); // Sort by consumption descending

    console.log('Sorted devices for chart:', sortedDevices);

    // Create arrays with only the actual devices (no empty slots)
    const chartData = sortedDevices.map(([, consumption]) => consumption);
    const labels = sortedDevices.map(([device]) => device.substring(device.length - 3)); // Show last 3 digits of serial

    console.log('Chart data processed:', { data: chartData, labels: labels });

    return { data: chartData, labels: labels };
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

    // Process today's data for device display
    const processedData = this.processTodaysDataForChart();
    const maxValue = Math.max(...processedData.data, 200); // Use 200 as minimum max for better visualization

    const chartData = {
      labels: processedData.labels,
      datasets: [{
        label: 'Water Usage (Liters)',
        data: processedData.data,
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
                  size: 12
                }
              }
            },
            y: {
              beginAtZero: true,
              max: maxValue,
              ticks: {
                stepSize: Math.max(20, Math.ceil(maxValue / 6)),
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
          },
          layout: {
            padding: {
              left: 10,
              right: 10,
              top: 10,
              bottom: 10
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
