import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
    selector: 'INVALID_COMPONENT',
    standalone: true,
    imports: [],
    template: 'INVALID_COMPONENT'
})
export abstract class BaseComponent implements OnDestroy {
    public subscription: Subscription = new Subscription();
    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
