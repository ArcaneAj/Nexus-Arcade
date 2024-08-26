import { Component, input, output } from '@angular/core';
import { TreeNode } from './tree-node.model';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-selection-tree',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './selection-tree.component.html',
    styleUrl: './selection-tree.component.scss',
})
export class SelectionTreeComponent {
    tree = input.required<TreeNode>();
    depth = input<number>(0);
    index = input.required<number>();
    expanded = input.required<number[]>();

    nodeSelected = output<TreeNode>({ alias: 'selectionChange' });

    toggle() {
        // If we just toggled ourselves and we aren't a leaf, unselect the current depth
        if (
            this.expanded()[this.depth()] === this.index() &&
            this.tree().children.length !== 0
        ) {
            this.expanded()[this.depth()] = -1;
        } else {
            // Select the current index at the current depth
            this.expanded()[this.depth()] = this.index();
        }

        // Forget everything downstream of the node we just replaced
        for (let i = this.depth() + 1; i < this.expanded().length; i++) {
            this.expanded()[i] = -1;
        }

        // If it was a leaf we selected, emit back up the tree
        if (this.tree().children.length === 0) {
            this.nodeSelected.emit(this.tree());
        }
    }

    selectionChange(child: TreeNode) {
        // Propagate selections up the tree
        this.nodeSelected.emit(child);
    }
}
