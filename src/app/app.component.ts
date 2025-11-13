import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { SplashScreenComponent } from './core/template/components/splash-screen/splash-screen/splash-screen.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NgIf,
    SplashScreenComponent 
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'scpi-doc-validation-front';
  isLoading = true;

  ngOnInit() {
    setTimeout(() => (this.isLoading = false), 3000);
  }
}
