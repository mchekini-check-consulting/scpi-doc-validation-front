import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/service/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  async onLogin(): Promise<void> {
    this.error = '';
    this.isLoading = true;

    try {
      await this.authService.login(this.username, this.password);
      
  
      if (this.authService.isAdmin()) {
        this.router.navigate(['/role-permission']);
      } else {
        this.error = 'Accès refusé. Vous devez avoir le rôle administrateur.';
        this.authService.logout(); 
      }
      
    } catch (err: any) {
      this.error = err.message || 'Erreur de connexion';
      console.error('Erreur:', this.error);
    } finally {
      this.isLoading = false;
    }
  }
}