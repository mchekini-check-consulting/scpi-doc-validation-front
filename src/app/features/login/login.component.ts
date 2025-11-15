import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  async onLogin(): Promise<void> {
    this.error = '';
    this.isLoading = true;

    try {
      await this.authService.login(this.username, this.password);

      const returnUrl =
        this.route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';

      this.router.navigate(['/splash'], {
        queryParams: { returnUrl },
      });
    } catch (err: any) {
      this.error = err.message || 'Erreur de connexion';
    } finally {
      this.isLoading = false;
    }
  }
}
