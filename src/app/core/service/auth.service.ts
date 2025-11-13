import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private TOKEN_KEY = 'access_token';

  private AUTH_URL =
    'https://keycloak.check-consulting.net/realms/doc-validation/protocol/openid-connect';

  private CLIENT_ID = 'scpi-doc-validation-front';
  private REQUIRED_ROLE = 'validator';

  constructor(private http: HttpClient, private router: Router) {}

  async login(username: string, password: string): Promise<boolean> {
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('client_id', this.CLIENT_ID);
    body.set('username', username);
    body.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    try {
      const tokenRes: any = await this.http
        .post(`${this.AUTH_URL}/token`, body.toString(), { headers })
        .toPromise();

      if (!tokenRes?.access_token) {
        console.error('No access_token in token response', tokenRes);
        return false;
      }

      const token = tokenRes.access_token;

      const payload = JSON.parse(atob(token.split('.')[1]));

      const roles: string[] = [
        ...(payload.realm_access?.roles || []),
        ...(payload.resource_access?.[this.CLIENT_ID]?.roles || []),
      ];

      console.log('User roles from token:', roles);

      if (this.REQUIRED_ROLE && !roles.includes(this.REQUIRED_ROLE)) {
        console.error('User missing required role', this.REQUIRED_ROLE);
        throw new Error('NOT_VALIDATOR');
      }

      localStorage.setItem(this.TOKEN_KEY, token);

      return true;
    } catch (e: any) {
      console.error('LOGIN ERROR', e?.error || e);

      if (e?.error?.error_description) {
        alert('Keycloak: ' + e.error.error_description);
      }

      throw e;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
