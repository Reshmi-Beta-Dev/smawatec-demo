import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alarms',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alarms.component.html',
  styleUrls: ['./alarms.component.css']
})
export class AlarmsComponent implements OnInit {
  selectedRow: number | null = null;

  ngOnInit() {
    // Initialize any component logic here
  }

  onRowClick(index: number) {
    this.selectedRow = this.selectedRow === index ? null : index;
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

  unhideAllAlarms() {
    this.showNotification('Showing all hidden alarms');
    
    // Restore all hidden alarms
    const hiddenRows = document.querySelectorAll('.message-table tbody tr');
    hiddenRows.forEach(row => {
      (row as HTMLElement).style.opacity = '1';
      (row as HTMLElement).style.textDecoration = 'none';
    });
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
