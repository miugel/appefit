import { Link, router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { generateRecipes } from "@/api/recipes";
import { Button } from "@/components/Button";
import { IngredientChip } from "@/components/IngredientChip";
import { RecipeCard } from "@/components/RecipeCard";
import { useRecipeStore } from "@/store/recipeStore";
import { ERROR_MESSAGES, UI } from "@/constants/messages";

export default function RecipeResultsScreen() {
  const [ingredientsOpen, setIngredientsOpen] = useState(false);
  const [fixOpen, setFixOpen] = useState(false);
  const [fixError, setFixError] = useState<string | undefined>();
  const [isFixing, setIsFixing] = useState(false);

  const recipeBatches = useRecipeStore((state) => state.recipeBatches);
  const currentBatchIndex = useRecipeStore((state) => state.currentBatchIndex);
  const goToNextBatch = useRecipeStore((state) => state.goToNextBatch);
  const goToPreviousBatch = useRecipeStore((state) => state.goToPreviousBatch);
  const detectedIngredients = useRecipeStore((state) => state.detectedIngredients);
  const correctionContext = useRecipeStore((state) => state.correctionContext);
  const canRefresh = useRecipeStore((state) => state.canRefresh);
  const exhaustionReason = useRecipeStore((state) => state.exhaustionReason);
  const refreshCount = useRecipeStore((state) => state.refreshCount);
  const [fixText, setFixText] = useState(correctionContext);

  const isFirstBatch = currentBatchIndex === 0;
  const isLastBatch = currentBatchIndex === recipeBatches.length - 1;
  const refreshLimitReached = refreshCount >= UI.MAX_REFRESHES_PER_SESSION;
  const refreshesRemaining = Math.max(UI.MAX_REFRESHES_PER_SESSION - refreshCount, 0);

  const rawRecipes = recipeBatches[currentBatchIndex] ?? [];
  const recipes = useMemo(
    () =>
      [...rawRecipes].sort(
        (a, b) => a.missingIngredients.length - b.missingIngredients.length,
      ),
    [rawRecipes],
  );

  function handleBack() {
    if (isFirstBatch) {
      router.back();
    } else {
      goToPreviousBatch();
    }
  }

  function handleForward() {
    if (isLastBatch) {
      useRecipeStore.getState().incrementRefreshCount();
      router.replace("/loading");
    } else {
      goToNextBatch();
    }
  }

  async function handleApplyFix() {
    const trimmedFix = fixText.trim();

    if (!trimmedFix) {
      setFixError(ERROR_MESSAGES.NO_FIX_TEXT);
      return;
    }

    const {
      imageBase64s,
      manualIngredients,
      shownRecipeFingerprints,
      setCorrectionContext,
      setDetectedIngredients,
      replaceBatch,
      addShownRecipes,
      setCanRefresh,
      setExhaustionReason,
    } = useRecipeStore.getState();

    setIsFixing(true);
    setFixError(undefined);
    setCorrectionContext(trimmedFix);

    try {
      const result = await generateRecipes({
        imageBase64s: imageBase64s.filter(Boolean),
        manualIngredients,
        correctionContext: trimmedFix,
        excludeRecipeFingerprints: shownRecipeFingerprints,
        refreshCount: 0,
      });

      setDetectedIngredients(result.detectedIngredients);
      setCanRefresh(result.canRefresh);
      setExhaustionReason(result.reason);

      if (result.recipes.length > 0) {
        replaceBatch(result.recipes);
        addShownRecipes(result.recipes);
        setFixText("");
        setFixOpen(false);
        return;
      }

      setFixOpen(false);
    } catch (error) {
      setFixError(
        error instanceof Error
          ? error.message
          : ERROR_MESSAGES.CONNECTION,
      );
    } finally {
      setIsFixing(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={handleBack} style={styles.breadcrumb}>
          <Text style={styles.breadcrumbText}>
            {isFirstBatch ? "← Start over" : "← Previous recipes"}
          </Text>
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
              <View style={styles.ingredientsBody}>
                <View style={styles.chips}>
                  {detectedIngredients.map((ingredient) => (
                    <IngredientChip key={ingredient} label={ingredient} />
                  ))}
                </View>
                {isFirstBatch ? (
                  <View style={styles.fixSection}>
                    <View style={styles.fixHeader}>
                      <View style={styles.fixHeaderText}>
                        <Text style={styles.fixTitle}>Need to fix something?</Text>
                        <Text style={styles.fixCopy}>
                          Add what AppéFit missed or should avoid.
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => {
                          setFixOpen((value) => !value);
                          setFixError(undefined);
                        }}
                        style={styles.fixToggle}
                      >
                        <Text style={styles.fixToggleText}>
                          {fixOpen ? "Close" : "Fix issue"}
                        </Text>
                      </Pressable>
                    </View>
                    {fixOpen ? (
                      <View style={styles.fixForm}>
                        <TextInput
                          maxLength={500}
                          multiline
                          onChangeText={setFixText}
                          placeholder="Example: The photo missed eggs, and I do not have rice."
                          placeholderTextColor="#8c9381"
                          style={styles.fixInput}
                          textAlignVertical="top"
                          value={fixText}
                        />
                        {fixError ? (
                          <Text style={styles.fixError}>{fixError}</Text>
                        ) : null}
                        <Button
                          disabled={isFixing}
                          label={isFixing ? "Updating..." : "Regenerate recipes"}
                          onPress={handleApplyFix}
                          variant="olive"
                        />
                      </View>
                    ) : null}
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}
        {isLastBatch && exhaustionReason ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              {exhaustionReason === "max_refreshes_reached"
                ? "You have reached the refresh limit for these ingredients. Add more ingredients or start a new scan for more ideas."
                : "We could not find enough new recipes with these ingredients. Try adding more ingredients or starting a new scan."}
            </Text>
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
        {isFixing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#71843d" />
          </View>
        ) : (
          <View style={styles.list}>
            {recipes.map((recipe) => (
              <Link asChild href={`/recipe/${recipe.id}`} key={recipe.id}>
                <Pressable>
                  <RecipeCard recipe={recipe} />
                </Pressable>
              </Link>
            ))}
          </View>
        )}
        {recipes.length ? (
          <>
            <Button
              disabled={isLastBatch && (!canRefresh || refreshLimitReached)}
              label={isLastBatch ? "Mix it up" : "Next recipe batch"}
              onPress={handleForward}
              variant="olive"
            />
            {isLastBatch && refreshCount > 0 ? (
              <Text style={styles.refreshCountText}>
                {refreshLimitReached
                  ? "Refresh limit reached for these ingredients."
                  : `${refreshesRemaining} refresh${refreshesRemaining === 1 ? "" : "es"} left for these ingredients.`}
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
  ingredientsBody: {
    gap: 14,
    borderTopWidth: 1,
    borderTopColor: "#d8d3ca",
    padding: 14,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  fixSection: {
    gap: 14,
    borderWidth: 1,
    borderColor: "#d6e4b5",
    borderRadius: 8,
    padding: 14,
    backgroundColor: "#ffffff",
  },
  fixHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  fixHeaderText: {
    flex: 1,
    gap: 3,
  },
  fixTitle: {
    color: "#1f2933",
    fontSize: 16,
    fontWeight: "800",
  },
  fixCopy: {
    color: "#52606d",
    fontSize: 14,
    lineHeight: 20,
  },
  fixToggle: {
    borderWidth: 1,
    borderColor: "#b8c984",
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#edf3df",
  },
  fixToggleText: {
    color: "#26351d",
    fontSize: 13,
    fontWeight: "800",
  },
  fixForm: {
    gap: 12,
  },
  fixInput: {
    minHeight: 92,
    borderWidth: 1,
    borderColor: "#d8d3ca",
    borderRadius: 8,
    padding: 12,
    color: "#1f2933",
    fontSize: 15,
    lineHeight: 21,
    backgroundColor: "#f8f7f4",
  },
  fixError: {
    color: "#9f3a38",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },
  list: {
    gap: 12,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
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
