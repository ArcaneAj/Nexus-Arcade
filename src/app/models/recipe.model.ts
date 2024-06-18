import { CraftJob } from "./craft-job.type";

export interface Recipe {
    id: number,
    CraftJobId: number,
    CraftJob: CraftJob,
    RecipeLevelTable: number,
    ItemId: number,
    Amount: number,
    Ingredients: {itemId: number, amount: number}[],
    Crystals: {itemId: number, amount: number}[],
}