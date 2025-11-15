import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './splash-screen.component.html',
  styleUrls: ['./splash-screen.component.css'],
})
export class SplashScreenComponent implements OnInit {
  dots = Array(4);

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const returnUrl =
      this.route.snapshot.queryParamMap.get('returnUrl') || '/landing';

    setTimeout(() => {
      this.router.navigateByUrl(returnUrl);
    }, 2000);
  }
}
