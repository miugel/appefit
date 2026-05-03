export function normalizeIngredients(ingredients: string[]) {
  return Array.from(
    new Set(
      ingredients
        .map((ingredient) => ingredient.trim().toLowerCase().replace(/\s+/g, " "))
        .filter(Boolean),
    ),
  );
}
