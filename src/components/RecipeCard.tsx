import { StyleSheet, Text, View } from "react-native";

import type { Recipe } from "@/types/recipe";

type RecipeCardProps = {
  recipe: Recipe;
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{recipe.title}</Text>
      <Text style={styles.copy}>{recipe.description}</Text>
      <Text style={styles.meta}>
        {recipe.totalTimeMinutes} min · {recipe.difficulty} ·{" "}
        {recipe.nutritionEstimate.calories} cal
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 8,
    borderWidth: 1,
    borderColor: "#e0d9cf",
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#ffffff",
  },
  title: {
    color: "#1f2933",
    fontSize: 18,
    fontWeight: "700",
  },
  copy: {
    color: "#52606d",
    fontSize: 15,
    lineHeight: 22,
  },
  meta: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },
});
