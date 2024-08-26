export interface Item {
    id: number;
    selected?: boolean;
    Singular: string;
    Plural: string;
    Description: string;
    Name: string;
    Icon: string;
    StackSize: number;
    Price_Mid_: number; // Shop purchase price
    Price_Low_: number; // Shop sell price
    craftable: boolean;
    itemLevel: number;
    equipLevel: string;
    recipeLevel?: number;
}
