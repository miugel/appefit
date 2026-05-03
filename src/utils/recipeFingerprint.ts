export function recipeFingerprint(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(
      /\b(easy|quick|simple|homemade|best|fresh|crispy|creamy|healthy|light)\b/g,
      "",
    )
    .trim()
    .replace(/\s+/g, "-");
}
