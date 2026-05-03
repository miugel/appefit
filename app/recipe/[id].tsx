import { Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useRecipeStore } from "@/store/recipeStore";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = useRecipeStore((state) =>
    state.recipes.find((item) => item.id === id),
  );

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Recipe" }} />
        <Text style={styles.title}>Recipe not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{recipe.title}</Text>
      <Text style={styles.copy}>{recipe.description}</Text>
      <Text style={styles.sectionTitle}>Steps</Text>
      {recipe.steps.map((step, index) => (
        <Text key={step} style={styles.copy}>
          {index + 1}. {step}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 14,
    padding: 24,
    paddingTop: 72,
    backgroundColor: "#f8f7f4",
  },
  title: {
    color: "#1f2933",
    fontSize: 30,
    fontWeight: "700",
  },
  sectionTitle: {
    marginTop: 12,
    color: "#1f2933",
    fontSize: 18,
    fontWeight: "700",
  },
  copy: {
    color: "#52606d",
    fontSize: 16,
    lineHeight: 24,
  },
});
