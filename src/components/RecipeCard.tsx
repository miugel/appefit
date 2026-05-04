import { StyleSheet, Text, View } from "react-native";

import type { Recipe } from "@/types/recipe";

type RecipeCardProps = {
  recipe: Recipe;
};

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{recipe.title}</Text>
      </View>
      <Text style={styles.nutrition}>
        {recipe.nutritionEstimate.calories}{" "}
        <Text style={styles.macroLabel}>cal</Text>
        {"  ·  "}
        {recipe.nutritionEstimate.proteinGrams}g{" "}
        <Text style={styles.macroLabel}>protein</Text>
        {"  ·  "}
        {recipe.nutritionEstimate.carbsGrams}g{" "}
        <Text style={styles.macroLabel}>carbs</Text>
        {"  ·  "}
        {recipe.nutritionEstimate.fatGrams}g{" "}
        <Text style={styles.macroLabel}>fat</Text>
      </Text>
      <Text style={styles.copy}>{recipe.description}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{recipe.totalTimeMinutes} min</Text>
        <Text style={styles.meta}>{recipe.difficulty}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 12,
    borderWidth: 1,
    borderColor: "#d6e4b5",
    borderRadius: 8,
    padding: 18,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    color: "#1f2933",
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
  nutrition: {
    color: "#52606d",
    fontSize: 13,
    fontWeight: "600",
  },
  macroLabel: {
    color: "#71843d",
    fontWeight: "800",
  },
  copy: {
    color: "#52606d",
    fontSize: 15,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  meta: {
    overflow: "hidden",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#edf3df",
    color: "#26351d",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "capitalize",
  },
});
