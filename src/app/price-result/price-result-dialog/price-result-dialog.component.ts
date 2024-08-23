import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PriceResultTreeComponent } from "../../price-result-tree/price-result-tree.component";
import { PriceResult } from '../../models/price-result.model';
  
@Component({
    selector: 'app-price-result-dialog',
    standalone: true,
    imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTooltipModule,
    PriceResultTreeComponent
],
    templateUrl: './price-result-dialog.component.html',
    styleUrl: './price-result-dialog.component.scss'
})
export class PriceResultDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: {
        result: PriceResult,
        },
    ) {
        console.log(data.result.history);
    }
}