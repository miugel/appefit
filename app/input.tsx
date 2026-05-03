import { router } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/Button";
import { useRecipeStore } from "@/store/recipeStore";

export default function IngredientInputScreen() {
  const [error, setError] = useState("");
  const [isSecondaryOpen, setIsSecondaryOpen] = useState(false);
  const manualIngredients = useRecipeStore((state) => state.manualIngredients);
  const setManualIngredients = useRecipeStore(
    (state) => state.setManualIngredients,
  );
  const imageUri = useRecipeStore((state) => state.imageUri);

  function handleGenerate() {
    if (!manualIngredients.trim() && !imageUri) {
      setError(
        "Add a photo, type ingredients, or use voice before generating recipes.",
      );
      return;
    }

    setError("");
    router.push("/loading");
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Add your ingredients</Text>
            <Text style={styles.copy}>
              Snap what you have and AppéFit will turn it into five healthy
              recipe ideas.
            </Text>
          </View>
          <View style={styles.photoButton}>
            <View style={styles.photoIcon}>
              <View style={styles.photoLens} />
            </View>
            <Text style={styles.photoButtonTitle}>Take a Photo</Text>
            <Text style={styles.photoButtonCopy}>
              Fastest way to capture fridge, pantry, or counter ingredients.
            </Text>
            <Text style={styles.photoButtonMeta}>
              Photo input arrives in milestone 3
            </Text>
          </View>
          <Pressable
            onPress={() => setIsSecondaryOpen((value) => !value)}
            style={styles.secondaryPanelHeader}
          >
            <View style={styles.secondaryHeaderText}>
              <Text style={styles.secondaryPanelTitle}>Other ways to add</Text>
              <Text style={styles.secondaryPanelCopy}>
                Dictate or type ingredients instead.
              </Text>
            </View>
            <Text style={styles.chevron}>{isSecondaryOpen ? "−" : "+"}</Text>
          </Pressable>
          {isSecondaryOpen ? (
            <View style={styles.secondaryPanel}>
              <Button label="Tap to Speak" variant="olive" />
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Manual ingredients</Text>
                <TextInput
                  multiline
                  onChangeText={(value) => {
                    setError("");
                    setManualIngredients(value);
                  }}
                  placeholder="chicken, rice, tomato, onion"
                  placeholderTextColor="#8b949e"
                  style={styles.input}
                  value={manualIngredients}
                />
              </View>
            </View>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
        <Button
          label="Generate Recipes"
          onPress={handleGenerate}
          variant="olive"
          style={styles.submit}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f7f4",
  },
  container: {
    flex: 1,
    padding: 24,
  },
  scrollContent: {
    gap: 20,
    paddingBottom: 20,
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
  photoButton: {
    alignItems: "center",
    gap: 10,
    borderWidth: 2,
    borderColor: "#c8d99a",
    borderRadius: 8,
    padding: 26,
    backgroundColor: "#edf3df",
  },
  photoIcon: {
    width: 72,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#71843d",
    borderRadius: 10,
    backgroundColor: "#f8f7f4",
  },
  photoLens: {
    width: 24,
    height: 24,
    borderWidth: 3,
    borderColor: "#71843d",
    borderRadius: 12,
    backgroundColor: "#d8e7b8",
  },
  photoButtonTitle: {
    color: "#26351d",
    fontSize: 22,
    fontWeight: "800",
  },
  photoButtonCopy: {
    maxWidth: 280,
    color: "#52606d",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  photoButtonMeta: {
    overflow: "hidden",
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#d8e7b8",
    color: "#26351d",
    fontSize: 12,
    fontWeight: "800",
  },
  secondaryPanelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    borderWidth: 1,
    borderColor: "#d8d3ca",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#ffffff",
  },
  secondaryHeaderText: {
    flex: 1,
    gap: 3,
  },
  secondaryPanelTitle: {
    color: "#1f2933",
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryPanelCopy: {
    color: "#52606d",
    fontSize: 14,
    lineHeight: 20,
  },
  chevron: {
    width: 34,
    height: 34,
    overflow: "hidden",
    borderRadius: 17,
    backgroundColor: "#d8e7b8",
    color: "#26351d",
    fontSize: 25,
    fontWeight: "700",
    lineHeight: 31,
    textAlign: "center",
  },
  secondaryPanel: {
    gap: 16,
    borderWidth: 1,
    borderColor: "#d8d3ca",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#ffffff",
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
    borderColor: "#c8d99a",
    borderRadius: 8,
    padding: 18,
    backgroundColor: "#fbfcf7",
    color: "#1f2933",
    fontSize: 17,
    lineHeight: 24,
    textAlignVertical: "top",
  },
  error: {
    color: "#9f3412",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  submit: {
    marginTop: 12,
  },
});
