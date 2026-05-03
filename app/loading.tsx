import { router } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { generateRecipes } from "@/api/recipes";
import { useRecipeStore } from "@/store/recipeStore";

export default function LoadingScreen() {
  const generationError = useRecipeStore((state) => state.generationError);
  const runGeneration = useGenerateRecipes();
  const hasStartedGeneration = useRef(false);

  useEffect(() => {
    if (hasStartedGeneration.current) {
      return;
    }

    hasStartedGeneration.current = true;
    runGeneration();
  }, [runGeneration]);

  if (generationError) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Could not generate recipes</Text>
        <Text style={styles.copy}>{generationError}</Text>
        <Button
          label="Try Again"
          onPress={() => {
            hasStartedGeneration.current = false;
            runGeneration();
          }}
          variant="olive"
        />
        <Button
          label="Back to Ingredients"
          onPress={() => router.replace("/input")}
          variant="secondary"
          style={styles.secondaryAction}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator color="#71843d" size="large" />
      <Text style={styles.title}>Analyzing ingredients...</Text>
      <Text style={styles.copy}>Building healthy recipe ideas...</Text>
      <Text style={styles.copy}>Checking for duplicates...</Text>
    </View>
  );
}

function useGenerateRecipes() {
  return useCallback(async () => {
    const {
      imageBase64,
      manualIngredients,
      shownRecipeFingerprints,
      refreshCount,
      setDetectedIngredients,
      setRecipes,
      addShownRecipes,
      setCanRefresh,
      setGenerationError,
      setExhaustionReason,
    } = useRecipeStore.getState();

    setGenerationError(undefined);
    setExhaustionReason(undefined);

    try {
      const result = await generateRecipes({
        imageBase64,
        manualIngredients,
        excludeRecipeFingerprints: shownRecipeFingerprints,
        refreshCount,
      });

      setDetectedIngredients(result.detectedIngredients);
      setCanRefresh(result.canRefresh);
      setExhaustionReason(result.reason);

      if (result.recipes.length === 5) {
        setRecipes(result.recipes);
        addShownRecipes(result.recipes);
      }

      router.replace("/recipes");
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Check your connection and try again.",
      );
    }
  }, []);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    padding: 24,
    backgroundColor: "#f8f7f4",
  },
  title: {
    color: "#1f2933",
    fontSize: 22,
    fontWeight: "700",
  },
  copy: {
    color: "#52606d",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  secondaryAction: {
    marginTop: 2,
  },
});
