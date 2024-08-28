import { Component, Inject } from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { DataCenter } from '../../models/datacenter.model';
import { World } from '../../models/world.model';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { SettingsService } from '../../services/settings.service';
import { CommonModule } from '@angular/common';
import { SelectionTreeComponent } from '../../selection-tree/selection-tree.component';
import { TreeNode } from '../../selection-tree/tree-node.model';
import { StorageService } from '../../services/storage.service';
import { UniversalisService } from '../../services/universalis.service';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ButtonComponent } from '../../button/button.component';

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
        SelectionTreeComponent,
        ButtonComponent,
    ],
    templateUrl: './settings-dialog.component.html',
    styleUrl: './settings-dialog.component.scss',
})
export class SettingsDialogComponent {
    public tree!: TreeNode;
    public expanded: number[] = [];
    public currentWorld: World;
    public newWorld: World;

    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: {
            worlds: World[];
            dataCenters: DataCenter[];
        },
        private dialogRef: MatDialogRef<SettingsDialogComponent>,
        private storage: StorageService,
        private settings: SettingsService,
        private universalis: UniversalisService,
    ) {
        this.currentWorld = this.data.worlds.find(
            (x) => x.name === this.settings.getCurrentWorld().name,
        )!;
        this.newWorld = this.currentWorld;
        this.GenerateWorldTree();
    }

    accept() {
        this.dialogRef.close(this.newWorld);
    }

    cancel() {
        this.dialogRef.close();
    }

    private GenerateWorldTree() {
        const worldDict: { [id: number]: World } = Object.fromEntries(
            this.data.worlds.map((item) => [item.id, item]),
        );
        const root: TreeNode = {
            name: '',
            children: [],
        };

        const sortedDataCenters = this.data.dataCenters.sort(
            (a, b) =>
                +isASCII(b.region) - +isASCII(a.region) ||
                b.region.localeCompare(a.region) ||
                a.name.localeCompare(b.name),
        );
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

    selectionChange(node: TreeNode) {
        const newWorld = this.data.worlds.find((x) => x.name === node.name);
        if (newWorld != null) {
            this.newWorld = newWorld;
        }
    }

    purge() {
        this.storage.purge();
        this.universalis.purgeCache();
        this.dialogRef.close();
    }
}

function isASCII(str: string): boolean {
    return /^[\x00-\x7F]*$/.test(str);
}
