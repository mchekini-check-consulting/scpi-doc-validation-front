import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

interface Lang {
  name: string;
  code: string;
  flag: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  q = '';
  lang: Lang[] = [
    { name: 'Français', code: 'fr', flag: 'img/Flag_fr.png' },
    { name: 'English', code: 'en', flag: 'img/Flag_gb.png' },
  ];

  selectedLang = 'Français';
  selectedFlag = 'img/Flag_fr.png';
  username = 'Nasser AIT AHMED';
  notifCount = 3;

  isLangOpen = false;
  isNotifOpen = false;
  isProfileOpen = false;

  constructor(private translate: TranslateService, private router: Router) {
    const savedLang = localStorage.getItem('lang') || 'fr';
    this.translate.setDefaultLang(savedLang);
    this.translate.use(savedLang);

    const langObj = this.lang.find((l) => l.code === savedLang);
    if (langObj) {
      this.selectedLang = langObj.name;
      this.selectedFlag = langObj.flag;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown')) {
      this.closeAll();
    }
  }

  toggleLang(e: Event) {
    e.stopPropagation();
    this.closeAll();
    this.isLangOpen = !this.isLangOpen;
  }

  toggleNotif(e: Event) {
    e.stopPropagation();
    this.closeAll();
    this.isNotifOpen = !this.isNotifOpen;
  }

  toggleProfile(e: Event) {
    e.stopPropagation();
    this.closeAll();
    this.isProfileOpen = !this.isProfileOpen;
  }

  closeAll() {
    this.isLangOpen = false;
    this.isNotifOpen = false;
    this.isProfileOpen = false;
  }

  switchLanguage(code: string) {
    const selected = this.lang.find((l) => l.code === code);
    if (selected) {
      this.selectedLang = selected.name;
      this.selectedFlag = selected.flag;
      this.isLangOpen = false;

      this.translate.use(code);

      localStorage.setItem('lang', code);
    }
  }

  onSearch(query: string) {
    console.log('Recherche :', query);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.closeAll();
    this.router.navigate(['/landing']);
  }
}
