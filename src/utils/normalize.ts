export function normalizeIngredientName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
