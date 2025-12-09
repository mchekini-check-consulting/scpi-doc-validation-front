import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
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

interface PermissionModification {
  permissionName: string;
  originalStandard: boolean;
  originalPremium: boolean;
  newStandard: boolean;
  newPremium: boolean;
}

@Component({
  selector: 'app-roles-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
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
  hasModifications: boolean = false;

  displayDialog: boolean = false;
  newPermission: CreatePermissionRequest = {
    name: '',
    permissionName: '',
    description: '',
  };
  newPermissionType: 'standard' | 'premium' = 'standard';

  private modifications = new Map<string, PermissionModification>();

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
        this.modifications.clear();
        this.hasModifications = false;
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

  getSelectedRole(permission: PermissionResponse): 'standard' | 'premium' | 'none' {
    const mod = this.modifications.get(permission.permissionName);
    
    if (mod) {
      if (mod.newStandard && mod.newPremium) return 'standard';
      if (!mod.newStandard && mod.newPremium) return 'premium';
      return 'none';
    } else {
      if (permission.assignedToStandard && permission.assignedToPremium) return 'standard';
      if (!permission.assignedToStandard && permission.assignedToPremium) return 'premium';
      return 'none';
    }
  }

  getStatusLabel(permission: PermissionResponse): string {
    const role = this.getSelectedRole(permission);
    if (role === 'standard') return 'Standard + Premium';
    if (role === 'premium') return 'Premium uniquement';
    return 'Désactivé';
  }

  onRoleSelect(permission: PermissionResponse, role: 'standard' | 'premium') {
    let newStandard = false;
    let newPremium = false;

    if (role === 'standard') {
      // Standard = Standard + Premium
      newStandard = true;
      newPremium = true;
    } else if (role === 'premium') {
      // Premium uniquement
      newStandard = false;
      newPremium = true;
    }

    this.modifications.set(permission.permissionName, {
      permissionName: permission.permissionName,
      originalStandard: permission.assignedToStandard,
      originalPremium: permission.assignedToPremium,
      newStandard,
      newPremium
    });

    this.checkForModifications();
  }

  private checkForModifications() {
    this.hasModifications = false;

    for (const mod of this.modifications.values()) {
      if (mod.originalStandard !== mod.newStandard || mod.originalPremium !== mod.newPremium) {
        this.hasModifications = true;
        break;
      }
    }
  }

  saveAllModifications() {
    if (!this.hasModifications || this.loading) return;

    this.loading = true;
    const requests: Promise<any>[] = [];

    for (const mod of this.modifications.values()) {
      // Gérer les changements pour Standard
      if (mod.newStandard !== mod.originalStandard) {
        if (mod.newStandard) {
          requests.push(
            this.permissionService.assignPermissionToRole({
              permissionName: mod.permissionName,
              roleName: 'standard'
            }).toPromise()
          );
        } else {
          requests.push(
            this.permissionService.removePermissionFromRole({
              permissionName: mod.permissionName,
              roleName: 'standard'
            }).toPromise()
          );
        }
      }

      // Gérer les changements pour Premium
      if (mod.newPremium !== mod.originalPremium) {
        if (mod.newPremium) {
          requests.push(
            this.permissionService.assignPermissionToRole({
              permissionName: mod.permissionName,
              roleName: 'premium'
            }).toPromise()
          );
        } else {
          requests.push(
            this.permissionService.removePermissionFromRole({
              permissionName: mod.permissionName,
              roleName: 'premium'
            }).toPromise()
          );
        }
      }
    }

    Promise.all(requests)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Toutes les modifications ont été enregistrées',
        });
        this.loadPermissions();
      })
      .catch((error) => {
        console.error('Erreur', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de sauvegarder les modifications',
        });
        this.loading = false;
      });
  }

  openCreateDialog() {
    this.displayDialog = true;
    this.newPermission = {
      name: '',
      permissionName: '',
      description: '',
    };
    this.newPermissionType = 'standard';
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
      next: (createdPermission) => {
        // Après la création, assigner aux rôles selon le type choisi
        const assignmentPromises: Promise<any>[] = [];

        if (this.newPermissionType === 'standard') {
          // Assigner à Standard ET Premium
          assignmentPromises.push(
            this.permissionService.assignPermissionToRole({
              permissionName: this.newPermission.permissionName,
              roleName: 'standard'
            }).toPromise()
          );
          assignmentPromises.push(
            this.permissionService.assignPermissionToRole({
              permissionName: this.newPermission.permissionName,
              roleName: 'premium'
            }).toPromise()
          );
        } else {
          // Assigner uniquement à Premium
          assignmentPromises.push(
            this.permissionService.assignPermissionToRole({
              permissionName: this.newPermission.permissionName,
              roleName: 'premium'
            }).toPromise()
          );
        }

        Promise.all(assignmentPromises)
          .then(() => {
            this.messageService.add({
              severity: 'success',
              summary: 'Succès',
              detail: 'Permission créée et assignée avec succès',
            });
            this.displayDialog = false;
            this.loadPermissions();
          })
          .catch((error) => {
            console.error('Erreur lors de l\'assignation', error);
            this.messageService.add({
              severity: 'warn',
              summary: 'Attention',
              detail: 'Permission créée mais erreur lors de l\'assignation',
            });
            this.displayDialog = false;
            this.loadPermissions();
          });
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
}