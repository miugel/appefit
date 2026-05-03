import type { Recipe } from "@/types/recipe";

export type GenerateRecipesRequest = {
  imageBase64?: string;
  manualIngredients?: string;
  excludeRecipeFingerprints: string[];
  refreshCount: number;
  maxRefreshes: number;
};

export type GenerateRecipesResponse = {
  detectedIngredients: string[];
  recipes: Recipe[];
  canRefresh: boolean;
  reason?: "max_refreshes_reached" | "not_enough_unique_recipes";
};

export async function generateRecipes(
  request: GenerateRecipesRequest,
): Promise<GenerateRecipesResponse> {
  const response = await fetch("http://localhost:3001/recipes/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error("Failed to generate recipes");
  }

  return response.json();
}
