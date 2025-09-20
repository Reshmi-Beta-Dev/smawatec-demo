import { Component, OnInit, OnChanges, SimpleChanges, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService, Building, BuildingGroup, City } from '../../services/supabase.service';

@Component({
  selector: 'app-building-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './building-form.component.html',
  styleUrls: ['./building-form.component.css']
})
export class BuildingFormComponent implements OnInit, OnChanges {
  @Output() success = new EventEmitter<Building>();
  @Output() cancel = new EventEmitter<void>();
  @Input() selectedGroupId: string | null = null;
  @Input() isEditMode: boolean = false;
  @Input() buildingData: Building | null = null;

  formData = {
    building_name: '',
    street_number: '',
    additional_address: '',
    zip_code: '',
    city: '',
    city_id: '',
    building_group_id: ''
  };

  // Dropdown options
  buildingGroups: BuildingGroup[] = [];
  cities: City[] = [];

  errors: any = {};
  isSubmitting = false;
  loading = false;

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    await this.loadDropdownData();
    if (this.isEditMode && this.buildingData) {
      this.populateFormForEdit();
    } else {
      this.resetForm();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['buildingData'] && changes['buildingData'].currentValue && this.isEditMode) {
      // Add a small delay to ensure dropdown data is loaded
      setTimeout(() => {
        this.populateFormForEdit();
      }, 100);
    }
    
    if (changes['isEditMode'] && changes['isEditMode'].currentValue && this.buildingData) {
      // Add a small delay to ensure dropdown data is loaded
      setTimeout(() => {
        this.populateFormForEdit();
      }, 100);
    }
  }

  private async loadDropdownData() {
    this.loading = true;
    try {
      // First test the connection
      const connectionTest = await this.supabaseService.testConnection();
      
      if (!connectionTest.success) {
        throw new Error(`Connection failed: ${JSON.stringify(connectionTest.error)}`);
      }
      
      const [buildingGroupsData, citiesData] = await Promise.all([
        this.supabaseService.getBuildingGroups(),
        this.supabaseService.getCities()
      ]);

      this.buildingGroups = buildingGroupsData || [];
      this.cities = citiesData || [];

      // Set default building group if one is selected
      if (this.selectedGroupId) {
        this.formData.building_group_id = this.selectedGroupId;
      }
    } catch (error: any) {
      console.error('Error loading dropdown data:', error);
      this.errors.general = `Failed to load form data: ${error?.message || 'Unknown error'}. Please refresh and try again.`;
    } finally {
      this.loading = false;
    }
  }

  resetForm() {
    this.formData = {
      building_name: '',
      street_number: '',
      additional_address: '',
      zip_code: '',
      city: '',
      city_id: '',
      building_group_id: this.selectedGroupId || ''
    };
    this.errors = {};
    this.isSubmitting = false;
  }

  populateFormForEdit() {
    if (this.buildingData) {
      this.formData = {
        building_name: this.buildingData.building_name || '',
        street_number: this.buildingData.street_number || '',
        additional_address: this.buildingData.additional_address || '',
        zip_code: this.buildingData.zip_code || '',
        city: this.buildingData.city || '',
        city_id: this.buildingData.city_id || '',
        building_group_id: this.buildingData.building_group_id || ''
      };
    }
    this.errors = {};
    this.isSubmitting = false;
  }

  validateForm(): boolean {
    this.errors = {};

    // Building name validation (REQUIRED - NOT NULL in database)
    if (!this.formData.building_name || this.formData.building_name.trim() === '') {
      this.errors.building_name = 'Building name is required';
    } else if (this.formData.building_name.trim().length < 2) {
      this.errors.building_name = 'Building name must be at least 2 characters';
    } else if (this.formData.building_name.trim().length > 100) {
      this.errors.building_name = 'Building name must be less than 100 characters';
    }

    // Building group validation (REQUIRED - NOT NULL in database)
    if (!this.formData.building_group_id) {
      this.errors.building_group_id = 'Building group is required';
    }

    // Street number validation (OPTIONAL)
    if (this.formData.street_number && this.formData.street_number.trim().length > 100) {
      this.errors.street_number = 'Street number must be less than 100 characters';
    }

    // Additional address validation (OPTIONAL)
    if (this.formData.additional_address && this.formData.additional_address.trim().length > 200) {
      this.errors.additional_address = 'Additional address must be less than 200 characters';
    }

    // Zip code validation (OPTIONAL)
    if (this.formData.zip_code && !/^\d{5}(-\d{4})?$/.test(this.formData.zip_code.trim())) {
      this.errors.zip_code = 'Please enter a valid zip code (e.g., 12345 or 12345-6789)';
    }

    // City validation (OPTIONAL)
    if (this.formData.city && this.formData.city.trim().length > 100) {
      this.errors.city = 'City must be less than 100 characters';
    }

    return Object.keys(this.errors).length === 0;
  }

  async onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    try {
      const buildingData = {
        building_name: this.formData.building_name.trim(),
        street_number: this.formData.street_number.trim() || null,
        additional_address: this.formData.additional_address.trim() || null,
        zip_code: this.formData.zip_code.trim() || null,
        city: this.formData.city.trim() || null,
        city_id: this.formData.city_id || null,
        building_group_id: this.formData.building_group_id
      };

      let data: Building;
      if (this.isEditMode && this.buildingData) {
        data = await this.supabaseService.updateBuilding(this.buildingData.id, buildingData);
      } else {
        data = await this.supabaseService.createBuilding(buildingData);
      }

      // Emit success event
      this.onSuccess(data);
      
    } catch (error: any) {
      console.error(`Error ${this.isEditMode ? 'updating' : 'creating'} building:`, error);
      
      // Handle specific error cases
      if (error.code === '23505') {
        this.errors.building_name = 'A building with this name already exists in the selected group';
      } else if (error.code === '23503') {
        this.errors.general = 'Invalid city or building group selected';
      } else {
        this.errors.general = `Failed to ${this.isEditMode ? 'update' : 'create'} building. Please try again.`;
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  onSuccess(data: Building) {
    this.success.emit(data);
    this.resetForm();
  }

  onCancel() {
    this.cancel.emit();
    this.resetForm();
  }

  getCurrentYear(): number {
    return new Date().getFullYear();
  }
}
