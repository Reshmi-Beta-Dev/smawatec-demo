import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';

@Component({
  selector: 'app-building-group-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './building-group-form.component.html',
  styleUrls: ['./building-group-form.component.css']
})
export class BuildingGroupFormComponent implements OnInit {
  formData = {
    name: '',
    description: '',
    address: '',
    zipCode: '',
    group_name: ''
  };
  
  errors: any = {};
  isSubmitting = false;
  loading = false;
  error: string | null = null;

  constructor(private mockDataService: MockDataService) {}

  ngOnInit() {
    // Initialize form
  }

  onSubmit() {
    this.showNotification('Building group form submitted');
  }

  onCancel() {
    this.showNotification('Building group form cancelled');
  }

  showNotification(message: string) {
    console.log('Notification:', message);
  }
}