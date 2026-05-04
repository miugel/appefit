import type { Recipe } from "@/types/recipe";

export type GenerateRecipesRequest = {
  imageBase64s?: string[];
  manualIngredients?: string;
  excludeRecipeFingerprints: string[];
  refreshCount: number;
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
  const payload = {
    ...request,
    imageBase64s: request.imageBase64s?.filter(Boolean),
  };

  const response = await fetch(`${getApiBaseUrl()}/generate-recipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Something went wrong. Check your connection and try again.";

    try {
      const errorBody = (await response.json()) as { error?: string };
      message = errorBody.error || message;
    } catch {
      // Keep the fallback message when the server did not return JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

function getApiBaseUrl() {
  return process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
}
