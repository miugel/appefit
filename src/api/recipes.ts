import type { Recipe } from "@/types/recipe";
import { MAX_RECIPE_PHOTOS } from "@/config/photos";
import { ERROR_MESSAGES, UI } from "@/constants/messages";
import { withTimeout } from "@/utils/debounce";

const MAX_RECIPE_REQUEST_BYTES = 25 * 1024 * 1024;
const API_TIMEOUT_MS = 30000; // 30 seconds

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

  try {
    const response = await withTimeout(
      fetch(`${getApiBaseUrl()}/generate-recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }),
      API_TIMEOUT_MS
    );

    if (!response.ok) {
      let message = ERROR_MESSAGES.CONNECTION;

      try {
        const errorBody = (await response.json()) as { error?: string };
        message = errorBody.error || message;
      } catch (parseError) {
        // Keep the fallback message when the server does not return JSON.
      }

      throw new Error(message);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error && error.message.includes("timeout")) {
      throw new Error(
        "Request took too long. Check your connection and try again."
      );
    }
    throw error;
  }
}

function getApiBaseUrl() {
  return process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3001";
}
