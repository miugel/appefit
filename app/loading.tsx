import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { OliveLogo } from "@/components/OliveLogo";
import { generateRecipes } from "@/api/recipes";
import { useRecipeStore } from "@/store/recipeStore";
import { TIMING, ERROR_MESSAGES } from "@/constants/messages";

const LOADING_MESSAGES = [
  "Counting macros with unreasonable confidence...",
  "Finding the protein angle...",
  "Keeping calories honest...",
  "Turning fridge chaos into gains...",
  "Making the cut taste less sad...",
  "Checking if this meal lifts...",
  "Balancing flavor and protein...",
  "Dodging empty calories...",
  "Assembling a plate with gym energy...",
  "Convincing vegetables to join the bulk...",
];

function randomIndex(exclude: number) {
  let next: number;
  do {
    next = Math.floor(Math.random() * LOADING_MESSAGES.length);
  } while (next === exclude);
  return next;
}

function useAnimatedMessage() {
  const [index, setIndex] = useState(() => randomIndex(-1));
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: TIMING.FADE_OUT_DURATION,
        useNativeDriver: true,
      }).start(() => {
        setIndex((i) => randomIndex(i));
        Animated.timing(opacity, {
          toValue: 1,
          duration: TIMING.FADE_IN_DURATION,
          useNativeDriver: true,
        }).start();
      });
    }, TIMING.MESSAGE_ROTATION_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return { message: LOADING_MESSAGES[index], opacity };
}

export default function LoadingScreen() {
  const generationError = useRecipeStore((state) => state.generationError);
  const runGeneration = useGenerateRecipes();
  const hasStartedGeneration = useRef(false);
  const { message, opacity } = useAnimatedMessage();

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
          onPress={handleBackToIngredients}
          variant="olive"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <OliveLogo size="lg" />
      <Animated.Text style={[styles.message, { opacity }]}>{message}</Animated.Text>
    </View>
  );
}

function handleBackToIngredients() {
  useRecipeStore.getState().setGenerationError(undefined);

  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace("/input");
}

function useGenerateRecipes() {
  return useCallback(async () => {
    const {
      imageBase64s,
      manualIngredients,
      correctionContext,
      shownRecipeFingerprints,
      refreshCount,
      setDetectedIngredients,
      addBatch,
      addShownRecipes,
      setCanRefresh,
      setGenerationError,
      setExhaustionReason,
    } = useRecipeStore.getState();

    setGenerationError(undefined);
    setExhaustionReason(undefined);

    try {
      const result = await generateRecipes({
        imageBase64s: imageBase64s.filter(Boolean),
        manualIngredients,
        correctionContext,
        excludeRecipeFingerprints: shownRecipeFingerprints,
        refreshCount,
      });

      setDetectedIngredients(result.detectedIngredients);
      setCanRefresh(result.canRefresh);
      setExhaustionReason(result.reason);

      if (result.recipes.length > 0) {
        addBatch(result.recipes);
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
    gap: 20,
    padding: 24,
    backgroundColor: "#f8f7f4",
  },
  message: {
    color: "#52606d",
    fontSize: 19,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 28,
  },
  title: {
    color: "#1f2933",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  copy: {
    color: "#52606d",
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
});
