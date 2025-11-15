import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.css'],
})
export class SplashScreenComponent {
constructor(private router: Router) {}
 dots = Array(4); 
   ngOnInit(): void {
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 2500);
  }
}
 

