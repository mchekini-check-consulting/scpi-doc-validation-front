import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empty-state.component.html',
  styleUrls: ['./empty-state.component.css']
})
export class EmptyStateComponent {
  @Input() title = 'Aucune donnée';
  @Input() message = 'Commencez par créer un nouvel élément.';
  @Input() actionLabel?: string = 'Créer';
  @Input() icon = 'pi pi-folder-open';
  @Output() action = new EventEmitter<void>();

  onAction() {
    this.action.emit();
  }
}
