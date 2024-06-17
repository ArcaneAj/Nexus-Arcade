import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DataCenter } from '../../models/datacenter.model';
import { World } from '../../models/world.model';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { SettingsService } from '../../services/settings.service';
import { CommonModule } from '@angular/common';
import { SelectionTreeComponent } from '../../selection-tree/selection-tree.component';
import { TreeNode } from '../../selection-tree/tree-node.model';
  
@Component({
    selector: 'app-settings-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatTreeModule,
        MatDialogModule,
        MatButtonModule,
        MatIconModule,
        SelectionTreeComponent,
    ],
    templateUrl: './settings-dialog.component.html',
    styleUrl: './settings-dialog.component.scss'
})
export class SettingsDialogComponent {

    public tree!: TreeNode;
    public expanded: number[] = [];

    constructor(@Inject(MAT_DIALOG_DATA) public data: {
        worlds: World[],
        dataCenters: DataCenter[]
        },
        private settings: SettingsService
    ) {
        this.GenerateWorldTree();
    }

    private GenerateWorldTree() {
        const selectedWorld: World = this.settings.getCurrentWorld();

        const worldDict: { [id: number]: World; } = Object.fromEntries(this.data.worlds.map(item => [item.id, item]));
        const root: TreeNode = {
            name: 'World Select',
            children: []
        }

        const sortedDataCenters = this.data.dataCenters.sort((a, b) => (+isASCII(b.region)) - (+isASCII(a.region)) || b.region.localeCompare(a.region) || a.name.localeCompare(b.name));
        for (const [dcIndex, dataCenter] of sortedDataCenters.entries()) {
            const dataCenterNode: TreeNode = {
                name: dataCenter.name,
                children: []
            }
            root.children.push(dataCenterNode);

            for (const [worldIndex, worldId] of dataCenter.worlds.entries()) {
                const world = worldDict[worldId];
                const worldNode: TreeNode = {
                    name: world.name,
                    children: []
                }
                dataCenterNode.children.push(worldNode);

                // Expand out to the currently selected node
                if (selectedWorld.name === world.name) {
                    this.expanded = [
                        0,
                        dcIndex,
                        worldIndex
                    ]
                }
            }
        }

        this.tree = root;
    }
    selectionChange(node: TreeNode) {
        console.log(node);
    }
}

function isASCII(str: string): boolean {
    return /^[\x00-\x7F]*$/.test(str);
}