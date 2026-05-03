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
        <Text style={styles.calories}>
          {recipe.nutritionEstimate.calories}
          {"\n"}cal
        </Text>
      </View>
      <Text style={styles.copy}>{recipe.description}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{recipe.totalTimeMinutes} min</Text>
        <Text style={styles.meta}>{recipe.difficulty}</Text>
        <Text style={styles.meta}>
          {recipe.nutritionEstimate.proteinGrams}g protein
        </Text>
      </View>
      <View style={styles.missingWrap}>
        <Text style={styles.missingLabel}>Missing</Text>
        <Text style={styles.missingText}>
          {recipe.missingIngredients.length
            ? recipe.missingIngredients.join(", ")
            : "Nothing major"}
        </Text>
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
  calories: {
    minWidth: 58,
    overflow: "hidden",
    borderRadius: 8,
    paddingVertical: 8,
    backgroundColor: "#d8e7b8",
    color: "#26351d",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 16,
    textAlign: "center",
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
  missingWrap: {
    gap: 3,
  },
  missingLabel: {
    color: "#71843d",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  missingText: {
    color: "#52606d",
    fontSize: 14,
    lineHeight: 20,
  },
});
