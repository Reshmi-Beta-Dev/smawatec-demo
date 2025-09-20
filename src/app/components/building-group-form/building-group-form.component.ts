import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService, BuildingGroup } from '../../services/supabase.service';

@Component({
  selector: 'app-building-group-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './building-group-form.component.html',
  styleUrls: ['./building-group-form.component.css']
})
export class BuildingGroupFormComponent implements OnInit {
  @Output() success = new EventEmitter<BuildingGroup>();
  @Output() cancel = new EventEmitter<void>();

  formData = {
    group_name: '',
    description: ''
  };

  errors: any = {};
  isSubmitting = false;

  constructor(private supabaseService: SupabaseService) {}

  ngOnInit() {
    this.resetForm();
  }

  resetForm() {
    this.formData = {
      group_name: '',
      description: ''
    };
    this.errors = {};
    this.isSubmitting = false;
  }

  validateForm(): boolean {
    this.errors = {};

    // Group name validation
    if (!this.formData.group_name || this.formData.group_name.trim() === '') {
      this.errors.group_name = 'Group name is required';
    } else if (this.formData.group_name.trim().length < 2) {
      this.errors.group_name = 'Group name must be at least 2 characters';
    } else if (this.formData.group_name.trim().length > 50) {
      this.errors.group_name = 'Group name must be less than 50 characters';
    }

    // Description validation (optional but if provided, validate)
    if (this.formData.description && this.formData.description.trim().length > 200) {
      this.errors.description = 'Description must be less than 200 characters';
    }

    return Object.keys(this.errors).length === 0;
  }

  async onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;

    try {
      const buildingGroupData = {
        group_name: this.formData.group_name.trim(),
        description: this.formData.description.trim() || null
      };

      const data = await this.supabaseService.createBuildingGroup(buildingGroupData);

      // Emit success event
      this.onSuccess(data);
      
    } catch (error: any) {
      console.error('Error creating building group:', error);
      
      // Handle specific error cases
      if (error.code === '23505') {
        this.errors.group_name = 'A building group with this name already exists';
      } else {
        this.errors.general = 'Failed to create building group. Please try again.';
      }
    } finally {
      this.isSubmitting = false;
    }
  }

  onSuccess(data: BuildingGroup) {
    this.success.emit(data);
    this.resetForm();
  }

  onCancel() {
    this.cancel.emit();
    this.resetForm();
  }
}
