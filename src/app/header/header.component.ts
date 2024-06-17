import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '../base.component';
import { StorageService } from '../services/storage.service';
import { DataCenter } from '../models/datacenter.model';
import { World } from '../models/world.model';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent extends BaseComponent implements OnInit {

    public dataCenters: DataCenter[] = [];
    public worlds: World[] = [];

    constructor(
        private storage: StorageService,
    ) {
        super();
    }
    
    ngOnInit(): void {
        this.subscription.add(this.storage.DataCenters().subscribe(x => this.dataCenters = x));
        this.subscription.add(this.storage.Worlds().subscribe(x => this.worlds = x));
    }
}
