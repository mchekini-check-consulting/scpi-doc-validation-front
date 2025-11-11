import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const TOKEN_ENDPOINT = 'https://keycloak.check-consulting.net/realms/scpi-realm/protocol/openid-connect/token';
const CLIENT_ID = 'scpi-invest-front';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';

  constructor(private router: Router) {}

  async login(username: string, password: string): Promise<boolean> {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('client_id', CLIENT_ID);
    formData.append('username', username);
    formData.append('password', password);

    try {
      const response = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      const data = await response.json();

      if (response.ok) {
     
        this.setToken(data.access_token);
        return true;
      } else {
        throw new Error(data.error_description || 'Erreur d\'authentification');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }
}