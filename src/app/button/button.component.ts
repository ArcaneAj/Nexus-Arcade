import {
    animate,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';

const CLEAN_DIRTY_MS = 200;
const DIRTY_CLEAN_MS = 200;

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
            transition('clean => dirty', [animate(CLEAN_DIRTY_MS)]),
            transition('dirty => clean', [animate(DIRTY_CLEAN_MS)]),
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
        }, CLEAN_DIRTY_MS);
    }
}
