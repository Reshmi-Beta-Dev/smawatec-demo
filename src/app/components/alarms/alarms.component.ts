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
      
      // Filter out hidden alarms
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
    return this.alarmMessages.filter(alarm => alarm.alarm_type_name === type).length;
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