export function normalizeIngredients(ingredients: string[]) {
  return Array.from(
    new Set(
      ingredients
        .flatMap((ingredient) => ingredient.split(/[,;\n]/g))
        .map((ingredient) =>
          ingredient
            .trim()
            .toLowerCase()
            .replace(/^[\s-]+/, "")
            .replace(/\s+/g, " "),
        )
        .filter(Boolean),
    ),
  );
}
