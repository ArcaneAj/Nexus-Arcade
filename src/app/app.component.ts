import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import {MatButtonModule} from '@angular/material/button';
import { UniversalisService } from './services/universalis.service';
import { TeamcraftService } from './services/teamcraft.service';



type NameData = {
    en: string,
    de: string,
    ja: string,
    fr: string,
}
type NameResponse = { [id: string] : NameData; }

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, MatButtonModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'ui';
    private subscription: Subscription = new Subscription();
    constructor(
        private universalis: UniversalisService,
        private teamcraft: TeamcraftService,
    ) {
    }
    
    click() {
        console.log("click");
        this.subscription.add(this.teamcraft.names().subscribe(x => console.log(x[1])));
        this.subscription.add(this.universalis.marketable().subscribe(x => console.log(x)));
    }
    
    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    ngOnInit(): void {
    }
}
