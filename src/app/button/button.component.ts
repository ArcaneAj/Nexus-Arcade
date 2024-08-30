import {
    animate,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

@Component({
    selector: 'app-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './button.component.html',
    styleUrl: './button.component.scss',
    animations: [
        trigger('onClick', [
            state(
                'clean',
                style({
                    opacity: 1,
                })
            ),
            state(
                'dirty',
                style({
                    opacity: 0.8,
                })
            ),
            transition('clean => dirty', [animate('0.2s')]),
            transition('dirty => clean', [animate('0.2s')]),
        ]),
    ],
})
export class ButtonComponent {
    public clicked = output<void>();
    public height = input<string>();
    public width = input<string>();
    public disabled = input<boolean>();

    public isDirty = false;
    mouseDown() {
        if (this.disabled() === true) {
            return;
        }

        this.isDirty = true;
        this.clicked.emit();
        setTimeout(() => {
            this.isDirty = false;
        }, 200);
    }
}
