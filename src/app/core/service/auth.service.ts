import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  resource_access?: {
    'scpi-invest-front'?: {
      roles?: string[];
    };
  };
  exp?: number;
  sub?: string;
  preferred_username?: string;
  email?: string;
  name?: string;
}

const TOKEN_ENDPOINT =
  'https://keycloak.check-consulting.net/realms/scpi-realm/protocol/openid-connect/token';
const CLIENT_ID = 'scpi-invest-front';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor() {}

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  removeToken(): void {
    localStorage.removeItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const now = Date.now() / 1000;
      return decoded.exp ? decoded.exp > now : false;
    } catch {
      return false;
    }
  }

  hasRole(role: string): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const roles = decoded.resource_access?.['scpi-invest-front']?.roles || [];
      return roles.includes(role);
    } catch {
      return false;
    }
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  async login(username: string, password: string): Promise<boolean> {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('client_id', CLIENT_ID);
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });

      const data = await response.json();

      if (response.ok) {
        this.setToken(data.access_token);

        sessionStorage.removeItem('splashShown');

        return true;
      } else {
        throw new Error(data.error_description || 'Erreur d’authentification');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  }

  logout(): void {
    this.removeToken();
    sessionStorage.removeItem('splashShown');
  }
}
