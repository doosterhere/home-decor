import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component( {
  selector: 'count-selector',
  templateUrl: './count-selector.component.html',
  styleUrls: ['./count-selector.component.scss']
} )
export class CountSelectorComponent {
  @Input() count: number = 1;

  @Output() onCountChange: EventEmitter<number> = new EventEmitter<number>();

  countChange(): void {
    this.onCountChange.emit( this.count );
  }

  decreaseCounter(): void {
    if (this.count > 1) {
      this.count--;
    }

    this.countChange();
  }

  increaseCounter(): void {
    this.count++;
    this.countChange();
  }
}
