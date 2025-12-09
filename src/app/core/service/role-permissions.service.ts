import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PermissionResponse {
  permissionName: string;
  name: string;
  description: string;
  assignedToStandard: boolean;
  assignedToPremium: boolean;
}

export interface CreatePermissionRequest {
  permissionName: string;
  description: string;
  name: string
}

export interface AssignPermissionRequest {
  permissionName: string;
  roleName: string;
}

@Injectable({
  providedIn: 'root'
})
export class RolePermissionService {
  private apiUrl = '/validation-api/v1/permissions';

  constructor(private http: HttpClient) {}

  getAllPermissions(): Observable<PermissionResponse[]> {
    return this.http.get<PermissionResponse[]>(this.apiUrl);
  }

  createPermission(request: CreatePermissionRequest): Observable<string> {
    return this.http.post(this.apiUrl, request, { responseType: 'text' });
  }

  assignPermissionToRole(request: AssignPermissionRequest): Observable<string> {
    return this.http.post(`${this.apiUrl}/assign`, request, { responseType: 'text' });
  }

  removePermissionFromRole(request: AssignPermissionRequest): Observable<string> {
    return this.http.delete(`${this.apiUrl}/assign`, { 
      body: request, 
      responseType: 'text' 
    });
  }

  getPermissionsByRole(roleName: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/role/${roleName}`);
  }
}