import {
  Component,
  EventEmitter,
  Output,
  HostListener,
  OnInit,
} from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  key: string;
}

export const ROUTES: RouteInfo[] = [
  {
    path: '/dashboard',
    title: 'Dashboard',
    key: 'SIDEBAR.DASHBOARD',
    icon: 'pi pi-home',
  },
  {
    path: '/tasks',
    title: 'Tasks Board',
    key: 'SIDEBAR.TASKS',
    icon: 'pi pi-briefcase',
  },

  {
    path: '/demand-history',
    title: 'Demand History',
    key: 'SIDEBAR.DEMAND-HISTORY',
    icon: 'pi pi-list',
  },
  {
    path: '/role-permission',
    title: 'Role & Permissions',
    key: 'SIDEBAR.ROLE-PERMISSION',
    icon: 'pi pi-user',
  },
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, NgForOf, NgIf, RouterModule, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  @Output() toggle = new EventEmitter<boolean>();
  menuItems: RouteInfo[] = [];
  isCollapsed = false;
  footerMenuOpen = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.menuItems = ROUTES;
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.toggle.emit(this.isCollapsed);
    this.footerMenuOpen = false;
  }

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: MouseEvent): void {
    const insideSidebar = (event.target as HTMLElement).closest(
      '.jira-sidebar'
    );
    if (!insideSidebar && this.footerMenuOpen) {
      this.footerMenuOpen = false;
    }
  }

  toggleFooterMenu(): void {
    this.footerMenuOpen = !this.footerMenuOpen;
  }

  openSettings(): void {
    console.log('Paramètres ouverts');
    this.footerMenuOpen = false;
  }

  openHelp(): void {
    console.log('Aide ouverte');
    this.footerMenuOpen = false;
  }

  openNotifications(): void {
    console.log('Notifications ouvertes');
    this.footerMenuOpen = false;
  }
}
