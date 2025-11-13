import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

import {
  DossierRow,
  DocumentSubRow,
  DocumentTypeKey,
  StatusKey,
  UserDocument,
  documentType,
  documentStatus,
} from '../../core/models/document.model';
import { DocumentService } from '../../core/service/documentService ';

@Component({
  selector: 'app-demand-history',
  standalone: true,
  imports: [CommonModule, TableModule, FormsModule, ToastModule],
  providers: [MessageService],
  templateUrl: './demand-history.component.html',
  styleUrls: ['./demand-history.component.scss'],
})
export class DemandHistoryComponent implements OnInit {
  dossiers: DossierRow[] = [];
  expandedId: string | null = null;
  isLoading = false;

  constructor(
    private documentService: DocumentService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchDocuments();
  }

  private fetchDocuments(): void {
    this.isLoading = true;
    this.documentService.getAllDocuments().subscribe({
      next: (docs) => {
        this.dossiers = this.buildDossiers(docs);
        this.isLoading = false;

        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `${docs.length} document(s) chargé(s) depuis le serveur.`,
          life: 3500,
        });
      },
      error: (err) => {
        console.error('Erreur lors du chargement des documents:', err);
        this.isLoading = false;

        this.messageService.add({
          severity: 'error',
          summary: 'Erreur de chargement',
          detail: 'Impossible de récupérer les documents depuis le serveur.',
          life: 4000,
        });
      },
    });
  }

  private buildDossiers(rows: UserDocument[]): DossierRow[] {
    const grouped = new Map<string, UserDocument[]>();

    rows.forEach((row) => {
      const key = row.userEmail;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(row);
    });

    const dossiers: DossierRow[] = [];

    grouped.forEach((docs, email) => {
      const fullName = docs[0].fullName;

      const subRows: DocumentSubRow[] = docs.map((doc) => {
        const { typeKey, typeLabel } = this.mapType(doc.type);
        const { statusKey, statusLabel } = this.mapStatus(doc.status);

        return {
          typeKey,
          typeLabel,
          statusKey,
          statusLabel,
          fileName: doc.originalFileName,
          uploadedAt: this.formatIsoDate(doc.uploadedAt),
          lastUpdatedAt: this.formatIsoDate(doc.lastUpdatedAt),
        };
      });

      const allStatusKeys = subRows.map((d) => d.statusKey);
      const globalStatusKey = this.computeGlobalStatus(allStatusKeys);
      const globalStatusLabel = this.mapStatusFromKey(globalStatusKey);
      const latestDate = this.getLatestDate(docs.map((d) => d.lastUpdatedAt));

      const docsSummary = `${
        subRows.filter((d) => d.statusKey !== 'pending-upload').length
      } / ${subRows.length} documents`;

      dossiers.push({
        id: email,
        fullName,
        userEmail: email,
        statusKey: globalStatusKey,
        statusLabel: globalStatusLabel,
        docsSummary,
        lastUpdatedAt: latestDate,
        documents: subRows,
        selected: false,
      });
    });

    return dossiers;
  }

  private mapType(type: documentType): {
    typeKey: DocumentTypeKey;
    typeLabel: string;
  } {
    switch (type) {
      case 'PIECE_IDENTITE':
        return { typeKey: 'piece-identite', typeLabel: "Pièce d'identité" };
      case 'AVIS_IMPOSITION':
        return { typeKey: 'avis-imposition', typeLabel: "Avis d'imposition" };
      default:
        return {
          typeKey: 'justificatif-domicile',
          typeLabel: 'Justificatif de domicile',
        };
    }
  }

  private mapStatus(status: documentStatus): {
    statusKey: StatusKey;
    statusLabel: string;
  } {
    switch (status) {
      case 'PENDING_UPLOAD':
        return { statusKey: 'pending-upload', statusLabel: 'En attente' };
      case 'UPLOADED':
        return { statusKey: 'uploaded', statusLabel: 'Téléversé' };
      case 'UNDER_REVIEW':
        return { statusKey: 'under-review', statusLabel: 'En revue' };
      case 'VALIDATED':
        return { statusKey: 'validated', statusLabel: 'Validé' };
      default:
        return { statusKey: 'rejected', statusLabel: 'Rejeté' };
    }
  }

  private mapStatusFromKey(key: StatusKey): string {
    switch (key) {
      case 'pending-upload':
        return 'En attente';
      case 'uploaded':
        return 'Incomplet';
      case 'under-review':
        return 'En revue';
      case 'validated':
        return 'Complet';
      case 'rejected':
        return 'À corriger';
    }
  }

  private computeGlobalStatus(statuses: StatusKey[]): StatusKey {
    if (statuses.includes('rejected')) return 'rejected';
    if (statuses.includes('under-review')) return 'under-review';
    if (statuses.every((s) => s === 'validated')) return 'validated';
    if (statuses.some((s) => s === 'uploaded')) return 'uploaded';
    return 'pending-upload';
  }

  private formatIsoDate(dateIso: string): string {
    if (!dateIso) return '';
    const date = new Date(dateIso);
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  private getLatestDate(dates: string[]): string {
    if (!dates.length) return '';
    const latest = dates.reduce((a, b) => (new Date(a) > new Date(b) ? a : b));
    return this.formatIsoDate(latest);
  }

  isExpanded(row: DossierRow): boolean {
    return this.expandedId === row.id;
  }

  toggleExpand(row: DossierRow): void {
    this.expandedId = this.isExpanded(row) ? null : row.id;
  }

  areAllSelected(): boolean {
    return this.dossiers.length > 0 && this.dossiers.every((d) => d.selected);
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.dossiers.forEach((d) => (d.selected = checked));
  }

  getInitials(name: string): string {
    return name
      ? name
          .split(' ')
          .map((p) => p[0])
          .join('')
          .toUpperCase()
      : '';
  }

  onTreatDossier(dossier: DossierRow): void {
   this.router.navigate(['/demand-history', 'traitement', dossier.userEmail], {
  state: { documents: dossier.documents },
});
  }
}

