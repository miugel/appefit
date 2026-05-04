import { Link, router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { generateRecipes } from "@/api/recipes";
import { IngredientChip } from "@/components/IngredientChip";
import { RecipeCard } from "@/components/RecipeCard";
import { useRecipeStore } from "@/store/recipeStore";

const MAX_REFRESHES_PER_SESSION = 3;

export default function RecipeResultsScreen() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const rawRecipes = useRecipeStore((state) => state.recipes);
  const recipes = useMemo(
    () =>
      [...rawRecipes].sort(
        (a, b) => a.missingIngredients.length - b.missingIngredients.length,
      ),
    [rawRecipes],
  );
  const detectedIngredients = useRecipeStore(
    (state) => state.detectedIngredients,
  );
  const canRefresh = useRecipeStore((state) => state.canRefresh);
  const exhaustionReason = useRecipeStore((state) => state.exhaustionReason);
  const refreshCount = useRecipeStore((state) => state.refreshCount);
  const hasRefreshed = refreshCount > 0;
  const refreshLimitReached = refreshCount >= MAX_REFRESHES_PER_SESSION;
  const refreshesRemaining = Math.max(
    MAX_REFRESHES_PER_SESSION - refreshCount,
    0,
  );

  async function handleRefresh() {
    if (!canRefresh || refreshLimitReached || isRefreshing) {
      return;
    }

    setIsRefreshing(true);
    setRefreshError("");

    const {
      imageBase64,
      manualIngredients,
      shownRecipeFingerprints,
      refreshCount: currentRefreshCount,
      setDetectedIngredients,
      setRecipes,
      addShownRecipes,
      incrementRefreshCount,
      setCanRefresh,
      setExhaustionReason,
    } = useRecipeStore.getState();

    const nextRefreshCount = currentRefreshCount + 1;

    incrementRefreshCount();
    setExhaustionReason(undefined);

    try {
      const result = await generateRecipes({
        imageBase64,
        manualIngredients,
        excludeRecipeFingerprints: shownRecipeFingerprints,
        refreshCount: nextRefreshCount,
      });

      setDetectedIngredients(result.detectedIngredients);
      setCanRefresh(result.canRefresh);
      setExhaustionReason(result.reason);

      if (result.recipes.length > 0) {
        setRecipes(result.recipes);
        addShownRecipes(result.recipes);
      }
    } catch (error) {
      setRefreshError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Check your connection and try again.",
      );
    } finally {
      setIsRefreshing(false);
    }
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
          <Text style={styles.breadcrumbText}>← Start over</Text>
        </Pressable>
        <View style={styles.header}>
          <Text style={styles.title}>Recipe ideas</Text>
          <Text style={styles.copy}>
            Structured options based on your ingredients.
          </Text>
        </View>
        {recipes.length > 0 ? (
          <Text style={styles.recipeCount}>
            {recipes.length} quality recipe{recipes.length === 1 ? "" : "s"} found
          </Text>
        ) : null}
        {detectedIngredients.length > 0 ? (
          <View style={styles.ingredientsContainer}>
            <Pressable
              onPress={() => setIngredientsOpen((v) => !v)}
              style={styles.ingredientsToggle}
            >
              <Text style={styles.ingredientsToggleText}>
                {ingredientsOpen ? "Hide" : "Show"} detected ingredients
              </Text>
              <Text style={styles.ingredientsChevron}>
                {ingredientsOpen ? "−" : "+"}
              </Text>
            </Pressable>
            {ingredientsOpen ? (
              <View style={styles.chips}>
                {detectedIngredients.map((ingredient) => (
                  <IngredientChip key={ingredient} label={ingredient} />
                ))}
              </View>
            ) : null}
          </View>
        ) : null}
        {exhaustionReason ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              {exhaustionReason === "max_refreshes_reached"
                ? "You have reached the refresh limit for these ingredients. Add more ingredients or start a new scan for more ideas."
                : "We could not find enough new recipes with these ingredients. Try adding more ingredients or starting a new scan."}
            </Text>
          </View>
        ) : null}
        {refreshError ? (
          <View style={styles.errorNotice}>
            <Text style={styles.errorText}>{refreshError}</Text>
          </View>
        ) : null}
        {!recipes.length ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No recipes yet</Text>
            <Text style={styles.emptyText}>
              Add more ingredients or try another photo to generate a full
              recipe set.
            </Text>
            <Button
              label="Back to Ingredients"
              onPress={() => router.replace("/input")}
              variant="olive"
            />
          </View>
        ) : null}
        <View style={styles.list}>
          {recipes.map((recipe) => (
            <Link asChild href={`/recipe/${recipe.id}`} key={recipe.id}>
              <Pressable>
                <RecipeCard recipe={recipe} />
              </Pressable>
            </Link>
          ))}
        </View>
        {recipes.length ? (
          <>
            <Button
              disabled={!canRefresh || refreshLimitReached || isRefreshing}
              label={
                isRefreshing ? "Regenerating..." : "Regenerate for new recipes"
              }
              onPress={handleRefresh}
              variant="olive"
            />
            {hasRefreshed ? (
              <Text style={styles.refreshCountText}>
                {refreshLimitReached
                  ? "Refresh limit reached for these ingredients."
                  : `${refreshesRemaining} refresh${
                      refreshesRemaining === 1 ? "" : "es"
                    } left for these ingredients.`}
              </Text>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  breadcrumb: {
    alignSelf: "flex-start",
  },
  breadcrumbText: {
    color: "#71843d",
    fontSize: 15,
    fontWeight: "700",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f7f4",
  },
  container: {
    gap: 20,
    padding: 24,
    paddingBottom: 32,
  },
  header: {
    gap: 8,
  },
  recipeCount: {
    color: "#1f2933",
    fontSize: 14,
    fontWeight: "600",
  },
  title: {
    color: "#1f2933",
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 0,
  },
  copy: {
    color: "#52606d",
    fontSize: 16,
    lineHeight: 24,
  },
  ingredientsContainer: {
    borderWidth: 1,
    borderColor: "#d8d3ca",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  ingredientsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  ingredientsToggleText: {
    color: "#52606d",
    fontSize: 14,
    fontWeight: "700",
  },
  ingredientsChevron: {
    color: "#52606d",
    fontSize: 18,
    fontWeight: "700",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#d8d3ca",
    padding: 14,
  },
  list: {
    gap: 12,
  },
  notice: {
    borderWidth: 1,
    borderColor: "#d6e4b5",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#edf3df",
  },
  noticeText: {
    color: "#52606d",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
  },
  errorNotice: {
    borderWidth: 1,
    borderColor: "#f4b8a8",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#fff4ef",
  },
  errorText: {
    color: "#9f3412",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 21,
  },
  emptyState: {
    gap: 12,
    borderWidth: 1,
    borderColor: "#d6e4b5",
    borderRadius: 8,
    padding: 18,
    backgroundColor: "#ffffff",
  },
  emptyTitle: {
    color: "#1f2933",
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    color: "#52606d",
    fontSize: 15,
    lineHeight: 22,
  },
  refreshCountText: {
    marginTop: -8,
    color: "#52606d",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    textAlign: "center",
  },
});
