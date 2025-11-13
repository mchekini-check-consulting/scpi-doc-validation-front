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
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  isLoading = false;

  constructor(private router: Router, private authService: AuthService) {}

  onLogin(): void {
    this.error = '';
    this.isLoading = true;

    this.authService
      .login(this.username, this.password)
      .then(() => {
        this.isLoading = false;
        this.router.navigate(['/splash']);
      })
      .catch((err) => {
        this.isLoading = false;

        if (err.message === 'NOT_VALIDATOR') {
          this.error = "Vous n'avez pas le rôle VALIDATOR";
        } else {
          this.error = 'Identifiants incorrects';
        }
        setTimeout(() => {
          this.error = '';
        }, 300000);
      });
  }
}
