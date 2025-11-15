import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
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

import { DocumentStatusStoreService } from '../../core/store/document-status-store.service';
import { DocumentService } from '../../core/service/documentService ';

@Component({
  selector: 'app-demand-history',
  standalone: true,
  imports: [CommonModule, TableModule, FormsModule],
  providers: [MessageService],
  templateUrl: './demand-history.component.html',
  styleUrls: ['./demand-history.component.scss'],
})
export class DemandHistoryComponent implements OnInit {
  dossiers: DossierRow[] = [];
  expanded: any = null;
  isLoading = false;
  isEmptyLoading = true;

  private avatarColors = [
    '#3B82F6',
    '#10B981',
    '#F59E0B',
    '#EF4444',
    '#8B5CF6',
    '#06B6D4',
    '#EC4899',
    '#84CC16',
  ];

  constructor(
    private documentService: DocumentService,
    private statusStore: DocumentStatusStoreService,
    private messageService: MessageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchDocuments();
  }

  private fetchDocuments(): void {
    this.isLoading = true;
    this.isEmptyLoading = true;

    this.documentService.getAllDocuments().subscribe({
      next: (result) => {
        const docs = result.content;
        const mergedDocs = this.applyLocalOverrides(docs);
        this.dossiers = this.buildDossiers(mergedDocs);

        this.isLoading = false;
        this.isEmptyLoading = this.dossiers.length === 0 ? false : false;
      },

      error: () => {
        this.isLoading = false;
        this.isEmptyLoading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger les documents.',
        });
      },
    });
  }

  private applyLocalOverrides(docs: UserDocument[]): UserDocument[] {
    return docs.map((doc) => {
      if (!doc.userEmail || !doc.id) return doc;

      const override = this.statusStore.getStatus(doc.userEmail, doc.id);
      if (!override) return doc;

      return {
        ...doc,
        status: this.mapKeyToBackendStatus(override.statusKey),
      };
    });
  }

  private buildDossiers(rows: UserDocument[]): DossierRow[] {
    const grouped = new Map<string, UserDocument[]>();

    rows.forEach((row) => {
      if (!grouped.has(row.userEmail)) grouped.set(row.userEmail, []);
      grouped.get(row.userEmail)!.push(row);
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

      const globalKey = this.computeGlobalStatus(
        subRows.map((d) => d.statusKey)
      );

      dossiers.push({
        id: email,
        fullName,
        userEmail: email,
        statusKey: globalKey,
        statusLabel: this.mapStatusFromKey(globalKey),
        docsSummary: `${
          subRows.filter((d) => d.statusKey !== 'pending-upload').length
        } / ${subRows.length} documents`,
        lastUpdatedAt: this.getLatestDate(docs.map((d) => d.lastUpdatedAt)),
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

  private mapStatus(status: documentStatus | string): {
    statusKey: StatusKey;
    statusLabel: string;
  } {
    switch (status) {
      case 'UPLOADED':
        return { statusKey: 'uploaded', statusLabel: 'Téléversé' };
      case 'UNDER_REVIEW':
        return { statusKey: 'under-review', statusLabel: 'En revue' };
      case 'VALIDATED':
        return { statusKey: 'validated', statusLabel: 'Valider' };
      case 'REJECTED':
        return { statusKey: 'rejected', statusLabel: 'À corriger' };
      default:
        return { statusKey: 'pending-upload', statusLabel: 'En attente' };
    }
  }

  private mapKeyToBackendStatus(key: StatusKey): documentStatus {
    const mapping: Record<StatusKey, documentStatus> = {
      'pending-upload': 'PENDING_UPLOAD',
      uploaded: 'UPLOADED',
      'under-review': 'UNDER_REVIEW',
      validated: 'VALIDATED',
      rejected: 'REJECTED',
    };

    return mapping[key];
  }

  private mapStatusFromKey(key: StatusKey): string {
    return {
      'pending-upload': 'En attente',
      uploaded: 'Incomplet',
      'under-review': 'En revue',
      validated: 'Valider',
      rejected: 'À corriger',
    }[key];
  }

  private computeGlobalStatus(statuses: StatusKey[]): StatusKey {
    if (statuses.includes('rejected')) return 'rejected';
    if (statuses.every((s) => s === 'validated')) return 'validated';
    if (statuses.includes('under-review')) return 'under-review';
    if (statuses.includes('uploaded')) return 'uploaded';
    return 'pending-upload';
  }

  private formatIsoDate(dateIso: string): string {
    if (!dateIso) return '';
    const d = new Date(dateIso);
    return `${String(d.getDate()).padStart(2, '0')}/${String(
      d.getMonth() + 1
    ).padStart(2, '0')}/${d.getFullYear()}`;
  }

  private getLatestDate(dates: string[]): string {
    if (!dates.length) return '';
    return this.formatIsoDate(
      dates.reduce((a, b) => (new Date(a) > new Date(b) ? a : b))
    );
  }

  isExpanded(d: any) {
    return this.expanded === d && !d.loading;
  }

  toggleExpandWithLoader(d: any) {
    if (d.loading) return;

    if (this.expanded === d) {
      this.expanded = null;
      return;
    }

    d.loading = true;
    this.expanded = d;

    setTimeout(() => (d.loading = false), 650);
  }

  getInitials(name: string) {
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }

  getAvatarColor(email: string): string {
    let h = 0;
    for (let i = 0; i < email.length; i++)
      h = email.charCodeAt(i) + ((h << 5) - h);
    return this.avatarColors[Math.abs(h) % this.avatarColors.length];
  }

  onTreatDossier(d: DossierRow) {
    this.router.navigate(['/demand-history', 'traitement'], {
      state: { email: d.userEmail },
    });
  }

  onViewDossier(d: DossierRow) {
    this.router.navigate(['/demand-history', 'traitement'], {
      state: { email: d.userEmail, readonly: true },
    });
  }

  areAllDocsTreated(dossier: DossierRow): boolean {
    return dossier.documents.every(
      (d) => d.statusKey === 'validated' || d.statusKey === 'rejected'
    );
  }
}
