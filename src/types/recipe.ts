export type Difficulty = "easy" | "medium" | "hard";

export type Ingredient = {
  name: string;
  confidence?: number;
};

export type RecipeIngredient = {
  name: string;
  quantity: string;
};

export type NutritionEstimate = {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;
  difficulty: Difficulty;
  missingIngredients: string[];
  ingredients: RecipeIngredient[];
  steps: string[];
  nutritionEstimate: NutritionEstimate;
};
