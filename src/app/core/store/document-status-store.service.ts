import { Injectable } from '@angular/core';
import { StatusKey } from '../models/document.model';
import { DocumentDBService } from './document-db.service';

export interface LocalStatusEntry {
    statusKey: StatusKey;
    statusLabel: string;
}

export type LocalStatusMap = {
    [docId: string]: LocalStatusEntry;
};

@Injectable({ providedIn: 'root' })
export class DocumentStatusStoreService {

    private cache: Record<string, LocalStatusMap> = {};

    constructor(private db: DocumentDBService) { }

    getOverrides(email: string): LocalStatusMap {
        if (this.cache[email]) return this.cache[email];

        const loaded = this.db.get(email);
        this.cache[email] = loaded || {};
        return this.cache[email];
    }

    getStatus(email: string, docId: string): LocalStatusEntry | null {
        const overrides = this.getOverrides(email);
        return overrides[docId] ?? null;
    }

    setStatus(
        email: string,
        docId: string,
        statusKey: StatusKey,
        statusLabel: string
    ) {
        const map = this.getOverrides(email);
        map[docId] = { statusKey, statusLabel };

        this.cache[email] = map;
        this.db.save(email, map);
    }


    clearEmail(email: string) {
        delete this.cache[email];
        this.db.delete(email);
    }
}
