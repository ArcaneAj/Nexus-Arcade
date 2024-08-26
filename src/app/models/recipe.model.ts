import { CraftJob } from './craft-job.type';
import { Ingredient } from './ingredient.model';

export interface Recipe {
    id: number;
    CraftJobId: number;
    CraftJob: CraftJob;
    RecipeLevel: number;
    ItemId: number;
    Amount: number;
    Ingredients: Ingredient[];
    Crystals: Ingredient[];
}
