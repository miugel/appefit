import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { IngredientChip } from "@/components/IngredientChip";
import { RecipeCard } from "@/components/RecipeCard";
import { useRecipeStore } from "@/store/recipeStore";

export default function RecipeResultsScreen() {
  const recipes = useRecipeStore((state) => state.recipes);
  const detectedIngredients = useRecipeStore(
    (state) => state.detectedIngredients,
  );
  const canRefresh = useRecipeStore((state) => state.canRefresh);
  const exhaustionReason = useRecipeStore((state) => state.exhaustionReason);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Recipe ideas</Text>
          <Text style={styles.copy}>
            Five structured options based on the ingredients from this session.
          </Text>
        </View>
        <View style={styles.chips}>
          {detectedIngredients.map((ingredient) => (
            <IngredientChip key={ingredient} label={ingredient} />
          ))}
        </View>
        {exhaustionReason ? (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              {exhaustionReason === "max_refreshes_reached"
                ? "You have reached the refresh limit for these ingredients. Add more ingredients or start a new scan for more ideas."
                : "We could not find enough new recipes with these ingredients. Try adding more ingredients or starting a new scan."}
            </Text>
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
        <Button
          disabled={!canRefresh}
          label="Refresh for 5 new recipes"
          variant="olive"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
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
});
