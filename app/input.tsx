import { Link } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { useRecipeStore } from "@/store/recipeStore";

export default function IngredientInputScreen() {
  const manualIngredients = useRecipeStore((state) => state.manualIngredients);
  const setManualIngredients = useRecipeStore(
    (state) => state.setManualIngredients,
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add your ingredients</Text>
      <View style={styles.photoButton}>
        <Text style={styles.photoButtonText}>Take or Upload Photo</Text>
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Ingredients</Text>
        <TextInput
          multiline
          onChangeText={setManualIngredients}
          placeholder="chicken, rice, tomato, onion"
          placeholderTextColor="#8b949e"
          style={styles.input}
          value={manualIngredients}
        />
      </View>
      <View style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Tap to Speak</Text>
      </View>
      <Link href="/loading" style={styles.primaryButton}>
        Generate Recipes
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 22,
    padding: 24,
    paddingTop: 72,
    backgroundColor: "#f8f7f4",
  },
  title: {
    color: "#1f2933",
    fontSize: 30,
    fontWeight: "700",
  },
  photoButton: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d8d3ca",
    borderRadius: 24,
    paddingVertical: 22,
    backgroundColor: "#ffffff",
  },
  photoButtonText: {
    color: "#1f2933",
    fontSize: 16,
    fontWeight: "700",
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    color: "#52606d",
    fontSize: 15,
    fontWeight: "700",
  },
  input: {
    minHeight: 150,
    borderWidth: 1,
    borderColor: "#d8d3ca",
    borderRadius: 24,
    padding: 18,
    backgroundColor: "#ffffff",
    color: "#1f2933",
    fontSize: 17,
    lineHeight: 24,
    textAlignVertical: "top",
  },
  secondaryButton: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f2933",
    borderRadius: 26,
    paddingVertical: 16,
  },
  secondaryButtonText: {
    color: "#1f2933",
    fontSize: 16,
    fontWeight: "700",
  },
  primaryButton: {
    marginTop: "auto",
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: "#1f2933",
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    paddingVertical: 18,
    textAlign: "center",
  },
});
