import { Component, Inject } from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PriceResultTreeComponent } from '../../price-result-tree/price-result-tree.component';
import { PriceResult } from '../../models/price-result.model';
import { ChartModule } from 'primeng/chart';
import { ButtonComponent } from '../../button/button.component';

@Component({
    selector: 'app-price-result-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatIconModule,
        MatTabsModule,
        MatTooltipModule,
        PriceResultTreeComponent,
        ChartModule,
        ButtonComponent,
    ],
    templateUrl: './price-result-dialog.component.html',
    styleUrl: './price-result-dialog.component.scss',
})
export class PriceResultDialogComponent {
    basicData: any;
    basicOptions: any;

    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            result: PriceResult;
        },
        private dialogRef: MatDialogRef<PriceResultDialogComponent>,
    ) {
        this.configureGraph();
    }

    close() {
        this.dialogRef.close();
    }

    configureGraph() {
        /// TESTING
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue(
            '--text-color-secondary',
        );
        const surfaceBorder =
            documentStyle.getPropertyValue('--surface-border');

        const dataWorldHq = this.data.result.history.entries
            .filter((e) => e.hq && e.worldName === this.data.result.world)
            .map((e) => {
                return {
                    x: HoursAgoFromTimestampSeconds(e.timestamp),
                    y: e.pricePerUnit,
                };
            });

        const dataWorldNq = this.data.result.history.entries
            .filter((e) => !e.hq && e.worldName === this.data.result.world)
            .map((e) => {
                return {
                    x: HoursAgoFromTimestampSeconds(e.timestamp),
                    y: e.pricePerUnit,
                };
            });

        const dataHq = this.data.result.history.entries
            .filter((e) => e.hq && !(e.worldName === this.data.result.world))
            .map((e) => {
                return {
                    x: HoursAgoFromTimestampSeconds(e.timestamp),
                    y: e.pricePerUnit,
                };
            });

        const dataNq = this.data.result.history.entries
            .filter((e) => !e.hq && !(e.worldName === this.data.result.world))
            .map((e) => {
                return {
                    x: HoursAgoFromTimestampSeconds(e.timestamp),
                    y: e.pricePerUnit,
                };
            });

        this.basicData = {
            datasets: [
                {
                    label: 'HQ World',
                    data: dataWorldHq,
                    backgroundColor: ['rgba(255, 159, 64, 0.2)'],
                    borderColor: ['rgb(255, 159, 64)'],
                    borderWidth: 1,
                },
                {
                    label: 'HQ DataCenter',
                    data: dataHq,
                    backgroundColor: ['rgba(54, 162, 235, 0.2)'],
                    borderColor: ['rgb(54, 162, 235)'],
                    borderWidth: 1,
                },
                {
                    label: 'NQ World',
                    data: dataWorldNq,
                    backgroundColor: ['rgba(75, 192, 192, 0.2)'],
                    borderColor: ['rgb(75, 192, 192)'],
                    borderWidth: 1,
                },
                {
                    label: 'NQ DataCenter',
                    data: dataNq,
                    backgroundColor: ['rgba(153, 102, 255, 0.2)'],
                    borderColor: ['rgb(153, 102, 255)'],
                    borderWidth: 1,
                },
            ],
        };

        this.basicOptions = {
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                    },
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: textColorSecondary,
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false,
                    },
                    title: {
                        display: true,
                        text: 'Sale Price (Gil)',
                    },
                },
                x: {
                    ticks: {
                        color: textColorSecondary,
                        callback: (x: number) => -x,
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false,
                    },
                    title: {
                        display: true,
                        text: 'Hours ago',
                    },
                },
            },
        };
    }
}

function HoursAgoFromTimestampSeconds(timestamp: number): number {
    return (timestamp - Date.now() / 1000) / 3600;
}
