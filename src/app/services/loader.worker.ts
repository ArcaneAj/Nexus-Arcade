/// <reference lib="webworker" />
import { Item } from '../models/item.model';
import { db } from '../db';
import { ItemRecipe } from '../models/item-recipe.model';
import { Recipe } from '../models/recipe.model';

export interface ItemCacheUpdateRequest {
    items: Item[];
    marketable: number[];
    recipes: Recipe[];
}

addEventListener(
    'message',
    async (ev: MessageEvent<ItemCacheUpdateRequest>) => {
        const items = ev.data.items;
        const marketable = ev.data.marketable;
        const recipes = await processRecipes(ev.data.recipes);
        for (const recipe of recipes) {
            items[recipe.id].craftable = true;
            for (const key in recipe.recipes) {
                const jobRecipe = recipe.recipes[key];
                const currentRecipeLevel = items[recipe.id].recipeLevel;
                if (
                    currentRecipeLevel == null ||
                    currentRecipeLevel > jobRecipe.RecipeLevel
                ) {
                    items[recipe.id].recipeLevel = jobRecipe.RecipeLevel;
                }
            }
        }

        const filteredItems: Item[] = items.filter((i) => !!i.Name);
        const marketableItems: Item[] = marketable
            .map((i) => items[i])
            .filter((i) => !!i.Name);

        await db.populateMarketableItemNames(marketableItems);
        await db.populateItemNames(filteredItems);
        postMessage('Complete');
    }
);

async function processRecipes(recipes: Recipe[]): Promise<ItemRecipe[]> {
    const recipesByItem: { [id: number]: ItemRecipe } = {};
    for (const recipe of recipes) {
        const itemId = recipe.ItemId;
        if (!itemId) {
            continue;
        }

        let entry = recipesByItem[itemId];
        if (entry == null) {
            entry = {
                id: itemId,
                recipes: {},
            };
            recipesByItem[itemId] = entry;
        }

        entry.recipes[recipe.CraftJobId] = recipe;
    }

    const itemRecipes: ItemRecipe[] = Object.keys(recipesByItem).map(
        (id) => recipesByItem[+id]
    );
    await db.populateRecipes(itemRecipes);
    return itemRecipes;
}
