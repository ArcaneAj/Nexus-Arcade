import { Recipe } from "./recipe.model";

export interface ItemRecipe {
    id: number,
    recipes: { [id: number] : Recipe; }
}