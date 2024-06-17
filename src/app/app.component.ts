import { Component } from '@angular/core';
// Custom components
import { SidebarComponent } from "./sidebar/sidebar.component";
import { HeaderComponent } from "./header/header.component";
import { MainComponent } from "./main/main.component";
import { StorageService } from './services/storage.service';
import { BaseComponent } from './base.component';

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    imports: [
        // Custom components
        SidebarComponent,
        HeaderComponent,
        MainComponent
    ]
})
export class AppComponent extends BaseComponent {
    constructor(
        private storage: StorageService,
    ) {
        super();
    }
    
    ngOnInit(): void {
        this.subscription.add(this.storage.DataCenters().subscribe(x => {
            if (x == null || x.length === 0) {
                this.storage.updateDataCenterCache();
            }
        }));
        this.subscription.add(this.storage.Worlds().subscribe(x => {
            if (x == null || x.length === 0) {
                this.storage.updateWorldCache();
            }
        }));
        this.subscription.add(this.storage.Items().subscribe(x => {
            if (x == null || x.length === 0) {
                this.storage.updateItemNameCache();
            }
        }));
    }
}
