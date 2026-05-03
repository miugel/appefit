import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useRecipeStore } from "@/store/recipeStore";

export default function RecipeResultsScreen() {
  const recipes = useRecipeStore((state) => state.recipes);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recipe ideas</Text>
      <View style={styles.list}>
        {recipes.map((recipe) => (
          <Link asChild href={`/recipe/${recipe.id}`} key={recipe.id}>
            <Pressable style={styles.card}>
              <Text style={styles.cardTitle}>{recipe.title}</Text>
              <Text style={styles.cardCopy}>{recipe.description}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
      <Pressable style={styles.button}>
        <Text style={styles.buttonText}>Refresh for 5 new recipes</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    padding: 24,
    paddingTop: 72,
    backgroundColor: "#f8f7f4",
  },
  title: {
    color: "#1f2933",
    fontSize: 30,
    fontWeight: "700",
  },
  list: {
    gap: 12,
  },
  card: {
    gap: 8,
    borderWidth: 1,
    borderColor: "#e0d9cf",
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#ffffff",
  },
  cardTitle: {
    color: "#1f2933",
    fontSize: 18,
    fontWeight: "700",
  },
  cardCopy: {
    color: "#52606d",
    fontSize: 15,
    lineHeight: 22,
  },
  button: {
    alignItems: "center",
    marginTop: "auto",
    borderRadius: 28,
    paddingVertical: 18,
    backgroundColor: "#1f2933",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },
});
