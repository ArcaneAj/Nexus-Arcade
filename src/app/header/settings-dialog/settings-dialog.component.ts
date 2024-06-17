import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DataCenter } from '../../models/datacenter.model';
import { World } from '../../models/world.model';
import { MatTreeFlatDataSource, MatTreeFlattener, MatTreeModule } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatIconModule } from '@angular/material/icon';

interface TreeNode {
    name: string;
    selected: boolean;
    children?: TreeNode[];
}

interface FlatNode {
    expandable: boolean;
    name: string;
    level: number;
}
  
@Component({
    selector: 'app-settings-dialog',
    standalone: true,
    imports: [MatTreeModule, MatDialogModule, MatButtonModule, MatIconModule],
    templateUrl: './settings-dialog.component.html',
    styleUrl: './settings-dialog.component.scss'
})
export class SettingsDialogComponent {

    constructor(@Inject(MAT_DIALOG_DATA) public data: {
        worlds: World[],
        dataCenters: DataCenter[]
    }) {
        const worldData: TreeNode = {
            name: "World Select",
            selected: false,
            children: []
        };

        const worldDict: { [id: number]: World; } = Object.fromEntries(data.worlds.map(item => [item.id, item]));
        
        for (const dataCenter of data.dataCenters) {
            const dataCenterNode: TreeNode = {
                name: dataCenter.name,
                selected: false,
                children: []
            };
            worldData.children?.push(dataCenterNode);

            for (const worldId of dataCenter.worlds) {
                const world: World = worldDict[worldId];
                const worldNode: TreeNode = {
                    name: world.name,
                    selected: false,
                }

                dataCenterNode.children?.push(worldNode);
            }
        }

        this.dataSource.data = [worldData];
    }

    private _transformer = (node: TreeNode, level: number) => {
        return {
            expandable: !!node.children && node.children.length > 0,
            name: node.name,
            level: level,
        };
    };
  
    treeControl = new FlatTreeControl<FlatNode>(
        node => node.level,
        node => node.expandable,
    );
  
    treeFlattener = new MatTreeFlattener(
        this._transformer,
        node => node.level,
        node => node.expandable,
        node => node.children,
    );
  
    dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  
    hasChild = (_: number, node: FlatNode) => node.expandable;
}
