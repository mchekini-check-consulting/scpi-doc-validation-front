import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { UserManagementService, User } from '../../services/user-management.service';

interface RoleOption {
  label: string;
  value: string;

}

@Component({
  selector: 'app-roles-permissions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    TagModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule
  ],
  templateUrl: './roles-permissions.component.html',
  styleUrl: './roles-permissions.component.scss',
  providers: [MessageService, ConfirmationService]
})
export class RolesPermissionsComponent implements OnInit {
  users: User[] = [];
  loading: boolean = false;
  
  roleOptions: RoleOption[] = [
    { label: 'Standard', value: 'standard'},
    { label: 'Premium', value: 'premium' },
    { label: 'Admin', value: 'admin' }
  ];

  constructor(
    private userService: UserManagementService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les utilisateurs'
        });
        this.loading = false;
      }
    });
  }

  onRoleChange(user: User, newRole: string) {
    this.confirmationService.confirm({
      message: `Êtes-vous sûr de vouloir changer le rôle de ${user.firstName} en ${newRole} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.updateUserRole(user.id, newRole);
      },
      reject: () => {
      
        this.loadUsers();
      }
    });
  }

  updateUserRole(userId: string, role: string) {
    this.userService.updateUserRole(userId, role).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Rôle mis à jour avec succès'
        });
        this.loadUsers();
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du rôle', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de mettre à jour le rôle'
        });
        this.loadUsers();
      }
    });
  }

  
  getRoleLabel(role: string): string {
    const roleLabels: { [key: string]: string } = {
      'admin': 'Admin',
      'premium': 'Premium',
      'standard': 'Standard',
      'none': 'Aucun'
    };
    return roleLabels[role?.toLowerCase()] || role;
  }
}