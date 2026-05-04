import type { Recipe } from "@/types/recipe";
import { MAX_RECIPE_PHOTOS } from "@/config/photos";
import { ERROR_MESSAGES, UI } from "@/constants/messages";

const MAX_RECIPE_REQUEST_BYTES = 25 * 1024 * 1024;

export type GenerateRecipesRequest = {
  imageBase64s?: string[];
  manualIngredients?: string;
  correctionContext?: string;
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
    correctionContext: request.correctionContext?.slice(0, UI.CORRECTION_CONTEXT_MAX_LENGTH),
    imageBase64s: request.imageBase64s
      ?.filter(Boolean)
      .slice(0, MAX_RECIPE_PHOTOS),
  };
  const body = JSON.stringify(payload);

  if (body.length > MAX_RECIPE_REQUEST_BYTES) {
    throw new Error(ERROR_MESSAGES.PHOTOS_TOO_LARGE);
  }

  const response = await fetch(`${getApiBaseUrl()}/generate-recipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  if (!response.ok) {
    let message = "Something went wrong. Check your connection and try again.";

    try {
      const errorBody = (await response.json()) as { error?: string };
      message = errorBody.error || message;
    } catch (parseError) {
      // Keep the fallback message when the server did not return JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

function getApiBaseUrl() {
  return process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
}
