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
  recipes: z.array(RecipeSchema).length(5),
});

export type ServerRecipe = z.infer<typeof RecipeSchema>;
