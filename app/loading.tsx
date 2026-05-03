import { router } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { mockDetectedIngredients, mockRecipes } from "@/data/mockRecipes";
import { useRecipeStore } from "@/store/recipeStore";

export default function LoadingScreen() {
  const setDetectedIngredients = useRecipeStore(
    (state) => state.setDetectedIngredients,
  );
  const setRecipes = useRecipeStore((state) => state.setRecipes);
  const addShownRecipes = useRecipeStore((state) => state.addShownRecipes);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDetectedIngredients(mockDetectedIngredients);
      setRecipes(mockRecipes);
      addShownRecipes(mockRecipes);
      router.replace("/recipes");
    }, 1200);

    return () => clearTimeout(timeout);
  }, [addShownRecipes, setDetectedIngredients, setRecipes]);

  return (
    <View style={styles.container}>
      <ActivityIndicator color="#71843d" size="large" />
      <Text style={styles.title}>Analyzing ingredients...</Text>
      <Text style={styles.copy}>Building healthy recipe ideas...</Text>
      <Text style={styles.copy}>Checking for duplicates...</Text>
    </View>
  );
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
  },
});
