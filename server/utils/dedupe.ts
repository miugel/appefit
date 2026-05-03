import { recipeFingerprint } from "../../src/utils/recipeFingerprint";
import type { ServerRecipe } from "../validation/recipeSchema";

export function isExcludedRecipe(title: string, excludedFingerprints: string[]) {
  return excludedFingerprints.includes(recipeFingerprint(title));
}

export function uniqueNonExcludedRecipes(
  recipes: ServerRecipe[],
  excludedFingerprints: string[],
) {
  const seen = new Set(excludedFingerprints);
  const uniqueRecipes: ServerRecipe[] = [];

  for (const recipe of recipes) {
    const fingerprint = recipeFingerprint(recipe.title);

    if (seen.has(fingerprint)) {
      continue;
    }

    seen.add(fingerprint);
    uniqueRecipes.push(recipe);
  }

  return uniqueRecipes;
}
