import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-template',
  standalone: true,
  imports: [SidebarComponent, NavbarComponent, RouterOutlet, NgClass],
  templateUrl: './template.component.html',
  styleUrls: ['./template.component.css']
})
export class TemplateComponent {
  isSidebarCollapsed = false;

  onToggleSidebar(collapsed: boolean) {
    this.isSidebarCollapsed = collapsed;
  }
}
