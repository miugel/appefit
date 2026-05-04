import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  Image,
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
import { MAX_RECIPE_PHOTOS } from "@/config/photos";
import { OliveLogo } from "@/components/OliveLogo";
import { useRecipeStore } from "@/store/recipeStore";

// type SpeechModule = typeof import("expo-speech-recognition");
// type SpeechEventSubscription = { remove: () => void };

export default function IngredientInputScreen() {
  const [error, setError] = useState("");
  const [isSecondaryOpen, setIsSecondaryOpen] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);
  // const [isListening, setIsListening] = useState(false);
  // const [voicePreview, setVoicePreview] = useState("");
  // const speechModuleRef = useRef<SpeechModule | null>(null);
  // const speechSubscriptionsRef = useRef<SpeechEventSubscription[]>([]);
  const manualIngredients = useRecipeStore((state) => state.manualIngredients);
  const setManualIngredients = useRecipeStore(
    (state) => state.setManualIngredients,
  );
  const imageUris = useRecipeStore((state) => state.imageUris);
  const addImages = useRecipeStore((state) => state.addImages);
  const removeImage = useRecipeStore((state) => state.removeImage);
  const startNewGeneration = useRecipeStore((state) => state.startNewGeneration);
  const recipeBatches = useRecipeStore((state) => state.recipeBatches);

  function handleGenerate() {
    if (!manualIngredients.trim() && !imageUris.length) {
      setError("Add a photo or type ingredients before generating recipes.");
      return;
    }

    setError("");
    startNewGeneration();
    router.push("/loading");
  }

  function handleSlotPress(index: number) {
    if (index < imageUris.length || isPickingImage) return;
    pickImage();
  }

  async function pickImage() {
    if (imageUris.length >= MAX_RECIPE_PHOTOS) return;

    setError("");
    setIsPickingImage(true);

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        setError("Camera access is needed to take an ingredient photo.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync(cameraPickerOptions);

      if (result.canceled) {
        return;
      }

      addImages(
        result.assets.map((asset) => ({
          uri: asset.uri,
          base64: asset.base64 ?? undefined,
        })),
      );
    } catch {
      setError("We had trouble opening your camera.");
    } finally {
      setIsPickingImage(false);
    }
  }

  // async function handleToggleDictation() { ... }
  // async function loadSpeechRecognition() { ... }

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
          <View style={styles.breadcrumbRow}>
            <Pressable onPress={() => router.navigate("/")}>
              <Text style={styles.breadcrumbText}>← AppéFit</Text>
            </Pressable>
            {recipeBatches.length > 0 ? (
              <Pressable onPress={() => router.push("/recipes")}>
                <Text style={styles.breadcrumbText}>Back to recipes →</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.header}>
            <OliveLogo size="sm" />
            <Text style={styles.title}>Add your ingredients</Text>
            <Text style={styles.copy}>
              Take a few quick photos of your ingredients and AppéFit will build practical, macro-aware recipes.
            </Text>
          </View>
          <View style={styles.photoSection}>
            <Text style={styles.photoSectionTitle}>Photos</Text>
            <Text style={styles.photoSectionCopy}>
              Use photos of your fridge, pantry, or counter.
            </Text>
            <View style={styles.photoSlots}>
              {Array.from({ length: MAX_RECIPE_PHOTOS }).map((_, index) => {
                const uri = imageUris[index];
                return (
                  <Pressable
                    key={`photo-${index}`}
                    onPress={() => handleSlotPress(index)}
                    style={[styles.slot, uri && styles.slotFilled]}
                    disabled={isPickingImage}
                  >
                    {uri ? (
                      <>
                        <Image source={{ uri }} style={styles.slotImage} />
                        <Pressable
                          onPress={() => removeImage(index)}
                          style={styles.slotRemove}
                          hitSlop={8}
                        >
                          <Text style={styles.slotRemoveText}>×</Text>
                        </Pressable>
                      </>
                    ) : (
                      <View style={styles.slotEmpty}>
                        <View style={styles.slotIcon}>
                          <View style={styles.slotLens} />
                        </View>
                        <Text style={styles.slotLabel}>
                          {index === 0 ? "Add photo" : `Photo ${index + 1}`}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
          <Pressable
            onPress={() => setIsSecondaryOpen((value) => !value)}
            style={styles.secondaryPanelHeader}
          >
            <View style={styles.secondaryHeaderText}>
              <Text style={styles.secondaryPanelTitle}>Other ways to add</Text>
              {/* <Text style={styles.secondaryPanelCopy}>
                Dictate or type ingredients instead.
              </Text> */}
            </View>
            <Text style={styles.chevron}>{isSecondaryOpen ? "−" : "+"}</Text>
          </Pressable>
          {isSecondaryOpen ? (
            <View style={styles.secondaryPanel}>
              {/* <Button
                label={isListening ? "Stop Listening" : "Tap to Speak"}
                onPress={handleToggleDictation}
                variant="olive"
              />
              {voicePreview ? (
                <Text style={styles.voicePreview}>{voicePreview}</Text>
              ) : null} */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Type ingredients</Text>
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
          disabled={!manualIngredients.trim() && !imageUris.length}
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
  photoSection: {
    gap: 12,
    borderWidth: 2,
    borderColor: "#c8d99a",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#edf3df",
  },
  photoSectionTitle: {
    color: "#26351d",
    fontSize: 17,
    fontWeight: "800",
  },
  photoSectionCopy: {
    color: "#52606d",
    fontSize: 14,
    marginTop: -4,
  },
  photoSlots: {
    flexDirection: "row",
    gap: 10,
  },
  slot: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#b8ce8a",
    borderStyle: "dashed",
    backgroundColor: "#f3f8e8",
    overflow: "hidden",
  },
  slotFilled: {
    borderStyle: "solid",
    borderColor: "#c8d99a",
  },
  slotImage: {
    width: "100%",
    height: "100%",
  },
  slotRemove: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  slotRemoveText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 20,
  },
  slotEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  slotIcon: {
    width: 32,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#71843d",
    borderRadius: 5,
    backgroundColor: "#f8f7f4",
  },
  slotLens: {
    width: 10,
    height: 10,
    borderWidth: 2,
    borderColor: "#71843d",
    borderRadius: 5,
    backgroundColor: "#d8e7b8",
  },
  slotLabel: {
    color: "#71843d",
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
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
  voicePreview: {
    borderWidth: 1,
    borderColor: "#c8d99a",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#edf3df",
    color: "#26351d",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 22,
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
  breadcrumbRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  breadcrumbText: {
    color: "#71843d",
    fontSize: 15,
    fontWeight: "700",
  },
});

const cameraPickerOptions: ImagePicker.ImagePickerOptions = {
  allowsEditing: false,
  base64: true,
  mediaTypes: ["images"],
  quality: 0.5,
};
