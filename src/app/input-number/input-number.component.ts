import { CommonModule } from '@angular/common';
import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as uuid from 'uuid';

@Component({
    selector: 'app-input-number',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './input-number.component.html',
    styleUrl: './input-number.component.scss',
})
export class InputNumberComponent {
    public height = input<number>();
    public min = input<number>();
    public max = input<number>();
    public content = model<number>();
    public id: string = uuid.v4();

    onChange() {
        const max = this.max();
        const min = this.min();
        const content = this.content();
        if (max != null && content != null && content > max) {
            this.content.set(max);
        }
        if (min != null && content != null && content < min) {
            this.content.set(min);
        }
    }
}
