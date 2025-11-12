import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { InputTextModule } from 'primeng/inputtext';

import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import {
  CreatePermissionRequest,
  PermissionResponse,
  RolePermissionService,
} from '../../core/service/role-permissions.service';

@Component({
  selector: 'app-roles-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    CheckboxModule,
    ToastModule,
    DialogModule,
    TextareaModule,
    InputTextModule
  ],
  templateUrl: './roles-permissions.component.html',
  styleUrl: './roles-permissions.component.scss',
  providers: [MessageService],
})
export class RolesPermissionsComponent implements OnInit {
  permissions: PermissionResponse[] = [];
  loading: boolean = false;

  displayDialog: boolean = false;
  newPermission: CreatePermissionRequest = {
    permissionName: '',
    description: '',
  };

  constructor(
    private permissionService: RolePermissionService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadPermissions();
  }

  loadPermissions() {
    this.loading = true;
    this.permissionService.getAllPermissions().subscribe({
      next: (data) => {
        this.permissions = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des permissions', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les permissions',
        });
        this.loading = false;
      },
    });
  }

  // Gère le changement de checkbox pour Standard
  onStandardChange(permission: PermissionResponse, checked: boolean) {
    const request = {
      permissionName: permission.permissionName,
      roleName: 'standard',
    };

    if (checked) {
      // Assigner la permission
      this.permissionService.assignPermissionToRole(request).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Permission assignée au rôle Standard',
          });
          this.loadPermissions();
        },
        error: (error) => {
          console.error('Erreur', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: "Impossible d'assigner la permission",
          });
          this.loadPermissions();
        },
      });
    } else {
      // Retirer la permission
      this.permissionService.removePermissionFromRole(request).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Permission retirée du rôle Standard',
          });
          this.loadPermissions();
        },
        error: (error) => {
          console.error('Erreur', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de retirer la permission',
          });
          this.loadPermissions();
        },
      });
    }
  }

  onPremiumChange(permission: PermissionResponse, checked: boolean) {
    const request = {
      permissionName: permission.permissionName,
      roleName: 'premium',
    };

    if (checked) {
      this.permissionService.assignPermissionToRole(request).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Permission assignée au rôle Premium',
          });
          this.loadPermissions();
        },
        error: (error) => {
          console.error('Erreur', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: "Impossible d'assigner la permission",
          });
          this.loadPermissions();
        },
      });
    } else {
      this.permissionService.removePermissionFromRole(request).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Succès',
            detail: 'Permission retirée du rôle Premium',
          });
          this.loadPermissions();
        },
        error: (error) => {
          console.error('Erreur', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de retirer la permission',
          });
          this.loadPermissions();
        },
      });
    }
  }

  openCreateDialog() {
    this.displayDialog = true;
    this.newPermission = {
      permissionName: '',
      description: '',
    };
  }

  savePermission() {
    if (!this.newPermission.permissionName.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Attention',
        detail: 'Le nom de la permission est obligatoire',
      });
      return;
    }

    this.permissionService.createPermission(this.newPermission).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Permission créée avec succès',
        });
        this.displayDialog = false;
        this.loadPermissions();
      },
      error: (error) => {
        console.error('Erreur', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de créer la permission',
        });
      },
    });
  }

  closeDialog() {
    this.displayDialog = false;
  }
}
