import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './button.component.html',
    styleUrl: './button.component.scss',
})
export class ButtonComponent {
    public clicked = output<void>();
    public height = input<string>();
    public width = input<string>();
    public disabled = input<boolean>();
    mouseDown() {
        if (this.disabled() !== true) {
            this.clicked.emit();
        }
    }
}
