import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  enabled: boolean;
  createdTimestamp?: number;
}

export interface UpdateRoleRequest {
  userId: string;
  newRole: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = '/api/v1/admin';

  constructor(private http: HttpClient) {}

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${userId}/role`, { role });
  }
}