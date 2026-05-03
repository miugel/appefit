import { recipeFingerprint } from "../../src/utils/recipeFingerprint";

export function isExcludedRecipe(title: string, excludedFingerprints: string[]) {
  return excludedFingerprints.includes(recipeFingerprint(title));
}
