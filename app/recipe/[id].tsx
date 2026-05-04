import { router, Stack, useLocalSearchParams } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { useRecipeStore } from "@/store/recipeStore";

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = useRecipeStore((state) =>
    state.recipeBatches.flat().find((item) => item.id === id),
  );

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: "Recipe" }} />
        <View style={styles.emptyState}>
          <Text style={styles.title}>Recipe not found</Text>
          <Button
            label="Back to Recipes"
            onPress={() => router.replace("/recipes")}
            variant="olive"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.back()}
          style={styles.breadcrumb}
        >
          <Text style={styles.breadcrumbText}>← Back to recipes</Text>
        </Pressable>
        <View style={styles.header}>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.copy}>{recipe.description}</Text>
        </View>
        <View style={styles.metrics}>
          <Metric label="Prep" value={`${recipe.prepTimeMinutes} min`} />
          <Metric label="Cook" value={`${recipe.cookTimeMinutes} min`} />
          <Metric label="Total" value={`${recipe.totalTimeMinutes} min`} />
          <Metric label="Serves" value={`${recipe.servings}`} />
          <Metric label="Level" value={recipe.difficulty} />
        </View>
        <Section title="Ingredients">
          {recipe.ingredients.map((ingredient) => (
            <View
              key={`${ingredient.name}-${ingredient.quantity}`}
              style={styles.row}
            >
              <Text style={styles.rowName}>{ingredient.name}</Text>
              <Text style={styles.rowValue}>{ingredient.quantity}</Text>
            </View>
          ))}
        </Section>
        {recipe.missingIngredients.length > 0 ? (
          <Section title="You'll also need">
            <Text style={styles.copy}>
              {recipe.missingIngredients.join(", ")}
            </Text>
          </Section>
        ) : null}
        <Section title="Steps">
          {recipe.steps.map((step, index) => (
            <View key={step} style={styles.stepRow}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </Section>
        <Section title="Nutrition Estimate">
          <View style={styles.nutritionGrid}>
            <Metric
              label="Calories"
              value={`${recipe.nutritionEstimate.calories}`}
            />
            <Metric
              label="Protein"
              value={`${recipe.nutritionEstimate.proteinGrams}g`}
            />
            <Metric
              label="Carbs"
              value={`${recipe.nutritionEstimate.carbsGrams}g`}
            />
            <Metric
              label="Fat"
              value={`${recipe.nutritionEstimate.fatGrams}g`}
            />
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f7f4",
  },
  container: {
    gap: 14,
    padding: 24,
    paddingBottom: 32,
  },
  breadcrumb: {
    alignSelf: "flex-start",
  },
  breadcrumbText: {
    color: "#71843d",
    fontSize: 15,
    fontWeight: "700",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
    padding: 24,
  },
  header: {
    gap: 10,
  },
  title: {
    color: "#1f2933",
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 36,
    letterSpacing: 0,
  },
  metrics: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  section: {
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#d6e4b5",
    paddingTop: 18,
  },
  sectionTitle: {
    color: "#1f2933",
    fontSize: 19,
    fontWeight: "800",
  },
  copy: {
    color: "#52606d",
    fontSize: 16,
    lineHeight: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    borderWidth: 1,
    borderColor: "#d6e4b5",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#fbfcf7",
  },
  rowName: {
    flex: 1,
    color: "#1f2933",
    fontSize: 15,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  rowValue: {
    maxWidth: "42%",
    color: "#52606d",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "right",
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepNumber: {
    width: 30,
    overflow: "hidden",
    borderRadius: 15,
    paddingVertical: 6,
    backgroundColor: "#d8e7b8",
    color: "#26351d",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
  },
  stepText: {
    flex: 1,
    color: "#52606d",
    fontSize: 16,
    lineHeight: 24,
  },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metric: {
    minWidth: 96,
    gap: 4,
    borderWidth: 1,
    borderColor: "#d6e4b5",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#edf3df",
  },
  metricLabel: {
    color: "#71843d",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metricValue: {
    color: "#1f2933",
    fontSize: 17,
    fontWeight: "800",
    textTransform: "capitalize",
  },
});
