import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

interface Board {
  id: string;
  title: string;
  path: string;
  image: string;
  isFavorite: boolean;
  lastVisited?: Date;
  type?: 'board' | 'doc' | 'dashboard';
  status: 'pending' | 'processing' | 'rejected' | 'valid';
  count: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TooltipModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  constructor(private router: Router) {}

  private destroy$ = new Subject<void>();

  isLoading = false;

  boards: Board[] = [
    {
      id: 'board-1',
      title: 'En attente de traitement',
      path: 'En attente de traitement',
      image: 'assets/img/pending.svg',
      isFavorite: false,
      status: 'pending',
      count: 25,
      lastVisited: new Date(),
    },
    {
      id: 'board-2',
      title: 'En cours d’analyse',
      path: 'En cours d’analyse',
      image: 'assets/img/processing.svg',
      isFavorite: false,
      status: 'processing',
      count: 135,
      lastVisited: new Date(),
    },
    {
      id: 'board-3',
      title: 'Demandes Rejetées',
      path: 'Demandes Rejetées',
      image: 'assets/img/reject.svg',
      isFavorite: false,
      status: 'rejected',
      count: 20,
      lastVisited: new Date(),
    },
    {
      id: 'board-4',
      title: 'Demandes Validées',
      path: 'Demandes Validées',
      image: 'assets/img/valid.svg',
      isFavorite: true,
      status: 'valid',
      count: 2,
      lastVisited: new Date(),
    },
  ];

  get displayedBoards(): Board[] {
    return this.boards.sort(
      (a, b) =>
        (b.lastVisited?.getTime() || 0) - (a.lastVisited?.getTime() || 0)
    );
  }

  ngOnInit(): void {
    this.loadBoards();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadBoards(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  toggleFavorite(board: Board): void {
    board.isFavorite = !board.isFavorite;
  }

  onCardClick(board: Board): void {
    console.log(`Card "${board.title}" clicked.`);

    // ✅ On peut ajouter une petite logique si tu veux différencier les statuts
    // (par exemple ouvrir une vue différente selon le statut)
    if (board.status === 'pending' || board.status === 'processing') {
      this.router.navigate(['/demand-history'], {
        queryParams: { status: board.status },
      });
    } else {
      this.router.navigate(['/demand-history']);
    }
  }

  trackByTitle(index: number, board: Board): string {
    return board.id;
  }

  getBoardIcon(board: Board): string {
    switch (board.type) {
      case 'board':
        return 'pi-table';
      case 'doc':
        return 'pi-file';
      case 'dashboard':
        return 'pi-chart-bar';
      default:
        return 'pi-table';
    }
  }
}
