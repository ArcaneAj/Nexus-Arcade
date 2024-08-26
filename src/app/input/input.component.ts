import { CommonModule } from '@angular/common';
import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-input',
    standalone: true,
    imports: [MatIconModule, CommonModule, FormsModule],
    templateUrl: './input.component.html',
    styleUrl: './input.component.scss',
})
export class InputComponent {
    public placeHolder: string = 'Item Search';
    public height = input<number>();
    public content = model<string>();
    public keydownEnter = output<void>();
    public keydownEscape = output<void>();
    clear() {
        this.content.set('');
    }
    emitEnter() {
        this.keydownEnter.emit();
    }
    emitEscape() {
        this.keydownEscape.emit();
    }
}
