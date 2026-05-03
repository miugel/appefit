import { z } from "zod";

export const RecipeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  prepTimeMinutes: z.number().int().nonnegative(),
  cookTimeMinutes: z.number().int().nonnegative(),
  totalTimeMinutes: z.number().int().nonnegative(),
  servings: z.number().int().positive(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  missingIngredients: z.array(z.string()).default([]),
  ingredients: z.array(
    z.object({
      name: z.string().min(1),
      quantity: z.string().min(1),
    }),
  ),
  steps: z.array(z.string().min(1)).min(1),
  nutritionEstimate: z.object({
    calories: z.number().nonnegative(),
    proteinGrams: z.number().nonnegative(),
    carbsGrams: z.number().nonnegative(),
    fatGrams: z.number().nonnegative(),
  }),
});

export const GenerateRecipesResponseSchema = z.object({
  recipes: z.array(RecipeSchema).min(1).max(5),
});

export const IngredientExtractionResponseSchema = z.object({
  ingredients: z.array(
    z.object({
      name: z.string().min(1),
      confidence: z.number().min(0).max(1).optional(),
    }),
  ),
});

export const GenerateRecipesRequestSchema = z
  .object({
    imageBase64: z.string().optional(),
    manualIngredients: z.string().optional(),
    excludeRecipeFingerprints: z.array(z.string()).default([]),
    refreshCount: z.number().int().nonnegative().default(0),
  })
  .refine(
    (value) => Boolean(value.imageBase64?.trim() || value.manualIngredients?.trim()),
    "imageBase64 or manualIngredients is required",
  );

export const GenerateRecipesApiResponseSchema = z.object({
  detectedIngredients: z.array(z.string()),
  recipes: z.array(RecipeSchema),
  canRefresh: z.boolean(),
  reason: z
    .enum(["max_refreshes_reached", "not_enough_unique_recipes"])
    .optional(),
});

export type ServerRecipe = z.infer<typeof RecipeSchema>;
export type GenerateRecipesRequest = z.infer<
  typeof GenerateRecipesRequestSchema
>;
