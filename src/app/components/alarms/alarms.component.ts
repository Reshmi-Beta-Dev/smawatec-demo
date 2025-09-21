import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService, AlarmCategory, AlarmMessage } from '../../services/mock-data.service';

@Component({
  selector: 'app-alarms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alarms.component.html',
  styleUrls: ['./alarms.component.css']
})
export class AlarmsComponent implements OnInit {
  selectedRow: number | null = null;
  
  // Alarm data properties
  alarmCategories: AlarmCategory[] = [];
  alarmMessages: AlarmMessage[] = [];
  allAlarmMessages: AlarmMessage[] = []; // Store all alarms for counting
  loading = false;
  error: string | null = null;

  // Pagination properties
  currentPage = 1;
  itemsPerPage = 8; // Show 8 rows per page
  totalItems = 0;
  totalPages = 0;

  // Math object for template
  Math = Math;

  // Hide alarm functionality
  hiddenAlarmIds: Set<string> = new Set();
  selectedAlarmForDetails: AlarmMessage | null = null;
  showDetailsModal: boolean = false;

  constructor(private mockDataService: MockDataService) {}

  async ngOnInit() {
    await this.loadAlarmCategories();
    await this.loadAlarmMessages();
  }

  onRowClick(index: number) {
    this.selectedRow = this.selectedRow === index ? null : index;
  }

  showDetails(event: Event, alarm: AlarmMessage) {
    event.stopPropagation();
    this.selectedAlarmForDetails = alarm;
    this.showDetailsModal = true;
  }

  hideAlarm(event: Event, alarmId: string) {
    event.stopPropagation();
    this.hiddenAlarmIds.add(alarmId);
    this.loadAlarmMessages();
    this.showNotification('Alarm hidden successfully');
  }

  // Alarm Categories
  async loadAlarmCategories() {
    try {
      this.loading = true;
      this.alarmCategories = await this.mockDataService.getAlarmCategories();
    } catch (error) {
      console.error('Error loading alarm categories:', error);
      this.error = 'Failed to load alarm categories';
    } finally {
      this.loading = false;
    }
  }

  // Alarm Messages
  async loadAlarmMessages() {
    try {
      this.loading = true;
      // Generate more data for pagination - request 100 items to ensure we have enough data
      const response = await this.mockDataService.getAlarmMessages(1, 100);
      
      // Store all alarms for counting (including hidden ones)
      this.allAlarmMessages = response.alarms;
      
      // Filter out hidden alarms for display
      const visibleAlarms = response.alarms.filter(alarm => !this.hiddenAlarmIds.has(alarm.id));
      
      this.totalItems = visibleAlarms.length;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      
      // Get the current page data
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex = startIndex + this.itemsPerPage;
      this.alarmMessages = visibleAlarms.slice(startIndex, endIndex);
    } catch (error) {
      console.error('Error loading alarm messages:', error);
      this.error = 'Failed to load alarm messages';
    } finally {
      this.loading = false;
    }
  }

  // Pagination methods
  onPageChange(page: number) {
    this.currentPage = page;
    this.loadAlarmMessages();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Utility methods
  showNotification(message: string) {
    console.log('Notification:', message);
    // You can implement a proper notification system here
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'status-active';
      case 'resolved':
        return 'status-resolved';
      case 'acknowledged':
        return 'status-acknowledged';
      default:
        return 'status-unknown';
    }
  }

  getSeverityClass(severity: string): string {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      case 'low':
        return 'severity-low';
      default:
        return 'severity-unknown';
    }
  }

  // Template helper methods
  getAlarmCount(type: string): number {
    // Count alarms from the complete dataset (allAlarmMessages), not just current page
    const count = this.allAlarmMessages.filter(alarm => {
      const alarmType = alarm.alarm_type_name || '';
      const severity = alarm.alarm_severity?.toLowerCase() || '';
      
      switch (type) {
        case 'major_leak':
          return alarmType === 'Major Leak' && severity === 'high';
        case 'auto_shutoff':
          return alarmType === 'Auto Shutoff' && severity === 'high';
        case 'low_temperature':
          return alarmType === 'Low Temperature' && severity === 'medium';
        case 'medium_leak':
          return alarmType === 'Minor Leak' && severity === 'medium';
        case 'micro_leak':
          return alarmType === 'Micro Leak' && severity === 'low';
        case 'wifi_connection_lost':
          return alarmType === 'Wifi Connection Lost' && severity === 'low';
        case 'power_loss':
          return alarmType === 'Power Loss' && severity === 'high';
        case 'valve_failure':
          return alarmType === 'Valve Failure' && severity === 'medium';
        case 'poor_wifi':
          return alarmType === 'Poor WiFi' && severity === 'low';
        default:
          return false;
      }
    }).length;
    
    // Debug logging to verify counts
    if (type === 'major_leak') {
      console.log('=== ALARM DATA DEBUG ===');
      console.log('Total alarms in complete dataset:', this.allAlarmMessages.length);
      console.log('Alarm types in complete dataset:', this.allAlarmMessages.map(a => ({ 
        type: a.alarm_type_name, 
        severity: a.alarm_severity 
      })).slice(0, 10));
      console.log('Major Leak count from complete dataset:', count);
      console.log('Major Leak alarms from complete dataset:', this.allAlarmMessages.filter(a => a.alarm_type_name === 'Major Leak' && a.alarm_severity === 'high'));
    }
    
    return count;
  }

  getTenantName(alarm: any): string {
    return alarm.tenant || 'N/A';
  }

  unhideAllAlarms() {
    this.hiddenAlarmIds.clear();
    this.loadAlarmMessages();
    this.showNotification('All hidden alarms restored');
  }

  showHiddenAlarms() {
    this.hiddenAlarmIds.clear();
    this.loadAlarmMessages();
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedAlarmForDetails = null;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getAlarmDuration(alarm: AlarmMessage): string {
    if (!alarm.resolved_at) return 'Ongoing';
    
    const created = new Date(alarm.created_at);
    const resolved = new Date(alarm.resolved_at);
    const diffMs = resolved.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    } else {
      return `${diffMinutes}m`;
    }
  }

  // Alias for template compatibility
  get alarms() {
    return this.alarmMessages;
  }
}