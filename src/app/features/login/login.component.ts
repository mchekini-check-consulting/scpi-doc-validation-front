import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {}

  onLogin(): void {
    this.error = '';
    this.isLoading = true;

    setTimeout(() => {
      this.isLoading = false;
      if (this.username && this.password) {
        this.router.navigate(['/dashboard']);
      } else {
        this.error = 'Identifiants incorrects.';
      }
    }, 700);
  }
}
