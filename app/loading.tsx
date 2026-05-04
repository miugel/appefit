import { router } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/Button";
import { OliveLogo } from "@/components/OliveLogo";
import { generateRecipes } from "@/api/recipes";
import { useRecipeStore } from "@/store/recipeStore";

const LOADING_MESSAGES = [
  "Raiding your virtual pantry...",
  "Negotiating with the AI chef...",
  "Making sure it doesn't taste like cardboard...",
  "Cross-referencing flavor science...",
  "Consulting the ghost of Julia Child...",
  "Calculating optimal snack potential...",
  "Checking if that's actually a food...",
  "Converting measurements to vibes...",
  "Plotting your culinary redemption arc...",
  "Pretending we have a Michelin star...",
];

function useLoadingMessage() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return LOADING_MESSAGES[index];
}

function ThinkingDots() {
  const dots = [useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current, useRef(new Animated.Value(0)).current];

  useEffect(() => {
    const pulse = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.delay(800),
        ]),
      );

    const animations = dots.map((dot, i) => pulse(dot, i * 160));
    animations.forEach((a) => a.start());
    return () => animations.forEach((a) => a.stop());
  }, []);

  return (
    <View style={styles.dots}>
      {dots.map((opacity, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity }]} />
      ))}
    </View>
  );
}

export default function LoadingScreen() {
  const generationError = useRecipeStore((state) => state.generationError);
  const runGeneration = useGenerateRecipes();
  const hasStartedGeneration = useRef(false);
  const loadingMessage = useLoadingMessage();

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
      <OliveLogo size="lg" />
      <ThinkingDots />
      <Text style={styles.message}>{loadingMessage}</Text>
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

      if (result.recipes.length > 0) {
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
    gap: 20,
    padding: 24,
    backgroundColor: "#f8f7f4",
  },
  dots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#71843d",
  },
  message: {
    color: "#52606d",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 24,
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
  secondaryAction: {
    marginTop: 2,
  },
});
