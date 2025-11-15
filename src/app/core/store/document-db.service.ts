import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DocumentDBService {

  private dbName = 'docStatusDB';

  save(email: string, data: any) {
    localStorage.setItem(`${this.dbName}_${email}`, JSON.stringify(data));
  }

  get(email: string): any {
    const raw = localStorage.getItem(`${this.dbName}_${email}`);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  delete(email: string) {
    localStorage.removeItem(`${this.dbName}_${email}`);
  }
}
