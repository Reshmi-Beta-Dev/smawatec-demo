import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../services/mock-data.service';

@Component({
  selector: 'app-building-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './building-form.component.html',
  styleUrls: ['./building-form.component.css']
})
export class BuildingFormComponent implements OnInit {
  formData = {
    name: '',
    address: '',
    zipCode: '',
    city: '',
    zip_code: '',
    city_id: '',
    building_name: '',
    building_group_id: '',
    street_number: '',
    additional_address: ''
  };
  
  errors: any = {};
  cities: any[] = [];
  buildingGroups: any[] = [];
  isSubmitting = false;
  isEditMode = false;
  loading = false;
  error: string | null = null;

  constructor(private mockDataService: MockDataService) {}

  ngOnInit() {
    // Initialize form with mock data
    this.cities = [
      { id: 1, name: 'Paris' },
      { id: 2, name: 'Lyon' },
      { id: 3, name: 'Marseille' }
    ];
    
    this.buildingGroups = [
      { id: 1, name: 'Group A' },
      { id: 2, name: 'Group B' },
      { id: 3, name: 'Group C' }
    ];
  }

  onSubmit() {
    this.showNotification('Building form submitted');
  }

  onCancel() {
    this.showNotification('Building form cancelled');
  }

  showNotification(message: string) {
    console.log('Notification:', message);
  }
}