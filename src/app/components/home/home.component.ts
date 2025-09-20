import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseAlarmsService, AlarmMessageBoard, AlarmStatistics, ConsumptionStatistics } from '../../services/supabase-alarms.service';

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
  alarms: AlarmMessageBoard[] = [];
  filteredAlarms: AlarmMessageBoard[] = [];
  alarmStats: AlarmStatistics | null = null;
  consumptionStats: ConsumptionStatistics | null = null;
  loading = false;
  error: string | null = null;
  
  // Pagination and display properties
  showAllAlarms = false;
  defaultDisplayCount = 10;
  sortByImportance = false;
  
  // Year properties for template
  currentYear = new Date().getFullYear();
  previousYear = new Date().getFullYear() - 1;

  constructor(private supabaseAlarmsService: SupabaseAlarmsService) {}

  async ngOnInit() {
    await Promise.all([
      this.loadAlarms(),
      this.loadAlarmStatistics(),
      this.loadConsumptionStatistics()
    ]);
  }

  async loadAlarms() {
    this.loading = true;
    this.error = null;
    
    try {
      this.alarms = await this.supabaseAlarmsService.getAlarmsMessageBoard();
      this.applySortingAndFiltering();
    } catch (error: any) {
      console.error('Error loading alarms:', error);
      this.error = `Failed to load alarms: ${error.message}`;
    } finally {
      this.loading = false;
    }
  }

  applySortingAndFiltering() {
    // Sort by importance (high severity first, then by created_at)
    let sortedAlarms = [...this.alarms];
    
    if (this.sortByImportance) {
      sortedAlarms.sort((a, b) => {
        // Define severity order: high > medium > low
        const severityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        const aSeverity = severityOrder[a.alarm_severity as keyof typeof severityOrder] || 0;
        const bSeverity = severityOrder[b.alarm_severity as keyof typeof severityOrder] || 0;
        
        if (aSeverity !== bSeverity) {
          return bSeverity - aSeverity; // Higher severity first
        }
        
        // If same severity, sort by created_at (newest first)
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    } else {
      // Sort by created_at only (newest first)
      sortedAlarms.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    
    // Apply pagination
    if (this.showAllAlarms) {
      this.filteredAlarms = sortedAlarms;
    } else {
      this.filteredAlarms = sortedAlarms.slice(0, this.defaultDisplayCount);
    }
  }

  toggleViewAll() {
    this.showAllAlarms = !this.showAllAlarms;
    this.applySortingAndFiltering();
  }

  toggleSortByImportance() {
    this.sortByImportance = !this.sortByImportance;
    this.applySortingAndFiltering();
  }

  async loadAlarmStatistics() {
    try {
      console.log('🔄 Loading alarm statistics...');
      this.alarmStats = await this.supabaseAlarmsService.getAlarmStatistics();
      console.log('✅ Alarm statistics loaded successfully:', this.alarmStats);
    } catch (error: any) {
      console.error('❌ Error loading alarm statistics:', error);
      // Don't set error state for statistics, just log it
    }
  }

  async loadConsumptionStatistics() {
    try {
      console.log('🔄 Loading consumption statistics...');
      this.consumptionStats = await this.supabaseAlarmsService.getConsumptionStatistics();
      console.log('✅ Consumption statistics loaded successfully:', this.consumptionStats);
      
      // Reinitialize chart with new data
      setTimeout(() => {
        this.initializeChart();
      }, 100);
    } catch (error: any) {
      console.error('❌ Error loading consumption statistics:', error);
      // Don't set error state for statistics, just log it
    }
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

    // Get monthly data from consumption statistics or use default
    const monthlyData = this.consumptionStats?.monthly_data || [];
    const chartData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{
        label: 'Water Consumption (m³)',
        data: this.getMonthlyChartData(monthlyData),
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

  private getMonthlyChartData(monthlyData: any[]): number[] {
    // Initialize array with 12 months (Jan-Dec) with default values
    const monthlyValues = new Array(12).fill(0);
    
    if (monthlyData && monthlyData.length > 0) {
      // Process the monthly data from Supabase
      monthlyData.forEach((monthData: any) => {
        const monthIndex = monthData.month - 1; // Convert to 0-based index
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyValues[monthIndex] = monthData.total_m3 || 0;
        }
      });
    } else {
      // Fallback to sample data if no real data is available
      return [32000, 28000, 35000, 42000, 38000, 45000, 48000, 52000, 46000, 40000, 36000, 33000];
    }
    
    return monthlyValues;
  }
}
