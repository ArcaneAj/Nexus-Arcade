import { Component, Inject } from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { World } from '../../models/world.model';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ButtonComponent } from '../../button/button.component';
import { InputComponent } from '../../input/input.component';
import { SelectionTreeComponent } from '../../selection-tree/selection-tree.component';
import { TreeNode } from '../../selection-tree/tree-node.model';
import { SettingsService } from '../../services/settings.service';
import { DataCenter } from '../../models/datacenter.model';
import { RequestService } from '../../services/request.service';
import { BaseComponent } from '../../base.component';
import { Item } from '../../models/item.model';
import { MatListModule } from '@angular/material/list';
import { ScrollingModule } from '@angular/cdk/scrolling';

@Component({
    selector: 'app-settings-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatTreeModule,
        MatDialogModule,
        MatIconModule,
        MatTabsModule,
        MatTooltipModule,
        ButtonComponent,
        InputComponent,
        SelectionTreeComponent,
        MatListModule,
        ScrollingModule,
    ],
    templateUrl: './order-dialog.component.html',
    styleUrl: './order-dialog.component.scss',
})
export class OrderDialogComponent extends BaseComponent {
    public name = ''; //TODO: Save this in local storage
    public tree!: TreeNode;
    public expanded: number[] = [];
    public newWorld: World;
    public currentWorld: World;

    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            selectedItems: Item[];
            worlds: World[];
            dataCenters: DataCenter[];
        },
        private dialogRef: MatDialogRef<OrderDialogComponent>,
        private settings: SettingsService,
        private requestService: RequestService
    ) {
        super();
        this.currentWorld = this.data.worlds.find(
            (x) => x.name === this.settings.getCurrentWorld().name
        )!;
        this.newWorld = this.currentWorld;
        this.GenerateWorldTree();

        this.subscription.add(
            this.settings.Settings().subscribe((x) => {
                for (const setting of x) {
                    if (setting.name === 'playerName') {
                        this.name = setting.value;
                    }
                }
            })
        );
    }

    accept() {
        this.settings.set('playerName', this.name);
        this.requestService
            .add({
                user: {
                    name: this.name,
                    world: this.currentWorld.name,
                },
                itemCrafts: this.data.selectedItems.map((x) => {
                    return {
                        itemId: x.id,
                        quantity: 1,
                    };
                }),
            })
            .subscribe((x: any) => console.log(x));
        this.dialogRef.close();
    }

    cancel() {
        console.log('list');
        this.requestService
            .list({
                name: 'Nesrie Kisne',
                world: 'Ravana',
            })
            .subscribe((x: any) => console.log(x));
        this.dialogRef.close();
    }

    selectionChange(node: TreeNode) {
        const newWorld = this.data.worlds.find((x) => x.name === node.name);
        if (newWorld != null) {
            this.newWorld = newWorld;
        }
    }

    private GenerateWorldTree() {
        const worldDict: { [id: number]: World } = Object.fromEntries(
            this.data.worlds.map((item) => [item.id, item])
        );
        const root: TreeNode = {
            name: '',
            children: [],
        };

        const sortedDataCenters = this.data.dataCenters.sort((a, b) => {
            return (
                +isASCII(b.region) - +isASCII(a.region) ||
                b.region.localeCompare(a.region) ||
                a.name.localeCompare(b.name)
            );
        });
        for (const [dcIndex, dataCenter] of sortedDataCenters.entries()) {
            const dataCenterNode: TreeNode = {
                name: dataCenter.name,
                children: [],
            };
            root.children.push(dataCenterNode);

            for (const [worldIndex, worldId] of dataCenter.worlds.entries()) {
                const world = worldDict[worldId];
                const worldNode: TreeNode = {
                    name: world.name,
                    children: [],
                };
                dataCenterNode.children.push(worldNode);

                // Expand out to the currently selected node
                if (this.currentWorld.name === world.name) {
                    this.expanded = [0, dcIndex, worldIndex];
                }
            }
        }

        this.tree = root;
    }
}

function isASCII(str: string): boolean {
    return /^[\x00-\x7F]*$/.test(str);
}
