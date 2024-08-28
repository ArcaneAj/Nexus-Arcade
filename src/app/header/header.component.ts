import { Component, OnInit, inject } from '@angular/core';
import { BaseComponent } from '../base.component';
import { StorageService } from '../services/storage.service';
import { DataCenter } from '../models/datacenter.model';
import { World } from '../models/world.model';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SettingsDialogComponent } from './settings-dialog/settings-dialog.component';
import { SettingsService } from '../services/settings.service';
import { ButtonComponent } from '../button/button.component';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [ButtonComponent, MatDialogModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
})
export class HeaderComponent extends BaseComponent implements OnInit {
    readonly dialog = inject(MatDialog);

    openDialog() {
        const dialogRef = this.dialog.open(SettingsDialogComponent, {
            data: {
                worlds: this.worlds,
                dataCenters: this.dataCenters,
            },
            height: '80vh',
        });

        dialogRef.afterClosed().subscribe((result: World | undefined) => {
            if (result !== undefined) {
                this.settings.setCurrentWorld(result);
            }
        });
    }

    public dataCenters: DataCenter[] = [];
    public worlds: World[] = [];

    constructor(
        private storage: StorageService,
        private settings: SettingsService,
    ) {
        super();
    }

    ngOnInit(): void {
        this.subscription.add(
            this.storage.DataCenters().subscribe((x) => (this.dataCenters = x)),
        );
        this.subscription.add(
            this.storage.Worlds().subscribe((x) => (this.worlds = x)),
        );
    }
}
