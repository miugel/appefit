import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
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
import { OliveLogo } from "@/components/OliveLogo";
import { useRecipeStore } from "@/store/recipeStore";
import { appendTranscript } from "@/utils/voice";

type SpeechModule = typeof import("expo-speech-recognition");
type SpeechEventSubscription = { remove: () => void };

export default function IngredientInputScreen() {
  const [error, setError] = useState("");
  const [isSecondaryOpen, setIsSecondaryOpen] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voicePreview, setVoicePreview] = useState("");
  const speechModuleRef = useRef<SpeechModule | null>(null);
  const speechSubscriptionsRef = useRef<SpeechEventSubscription[]>([]);
  const manualIngredients = useRecipeStore((state) => state.manualIngredients);
  const setManualIngredients = useRecipeStore(
    (state) => state.setManualIngredients,
  );
  const imageUri = useRecipeStore((state) => state.imageUri);
  const setImage = useRecipeStore((state) => state.setImage);
  const clearImage = useRecipeStore((state) => state.clearImage);
  const startNewGeneration = useRecipeStore((state) => state.startNewGeneration);

  useEffect(() => {
    return () => {
      speechSubscriptionsRef.current.forEach((subscription) =>
        subscription.remove(),
      );
      speechSubscriptionsRef.current = [];
      speechModuleRef.current?.ExpoSpeechRecognitionModule.abort();
    };
  }, []);

  function handleGenerate() {
    if (!manualIngredients.trim() && !imageUri) {
      setError(
        "Add a photo, type ingredients, or use voice before generating recipes.",
      );
      return;
    }

    setError("");
    startNewGeneration();
    router.push("/loading");
  }

  async function handleTakePhoto() {
    await pickImage("camera");
  }

  async function handleUploadPhoto() {
    await pickImage("library");
  }

  async function pickImage(source: "camera" | "library") {
    setError("");
    setIsPickingImage(true);

    try {
      const permission =
        source === "camera"
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setError(
          source === "camera"
            ? "Camera access is needed to take an ingredient photo."
            : "Photo library access is needed to upload an ingredient photo.",
        );
        return;
      }

      const result =
        source === "camera"
          ? await ImagePicker.launchCameraAsync(imagePickerOptions)
          : await ImagePicker.launchImageLibraryAsync(imagePickerOptions);

      if (result.canceled) {
        return;
      }

      const asset = result.assets[0];
      setImage(asset.uri, asset.base64 ?? undefined);
    } catch {
      setError("We had trouble opening your camera or photo library.");
    } finally {
      setIsPickingImage(false);
    }
  }

  async function handleToggleDictation() {
    setError("");

    if (isListening) {
      speechModuleRef.current?.ExpoSpeechRecognitionModule.stop();
      return;
    }

    try {
      const speechModule = await loadSpeechRecognition();
      const { ExpoSpeechRecognitionModule } = speechModule;

      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        setError("Speech recognition is not available on this device.");
        return;
      }

      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permission.granted) {
        setError("Microphone and speech recognition permissions are needed.");
        return;
      }

      setVoicePreview("");
      ExpoSpeechRecognitionModule.start({
        lang: "en-US",
        interimResults: true,
        continuous: false,
      });
    } catch {
      setError(
        "Voice input is unavailable in this build. You can still type ingredients manually.",
      );
      setIsListening(false);
    }
  }

  async function loadSpeechRecognition() {
    if (speechModuleRef.current) {
      return speechModuleRef.current;
    }

    const speechModule = await import("expo-speech-recognition");
    speechModuleRef.current = speechModule;

    const { ExpoSpeechRecognitionModule } = speechModule;

    speechSubscriptionsRef.current = [
      ExpoSpeechRecognitionModule.addListener("start", () => {
        setIsListening(true);
      }),
      ExpoSpeechRecognitionModule.addListener("end", () => {
        setIsListening(false);
      }),
      ExpoSpeechRecognitionModule.addListener("result", (event) => {
        const transcript = event.results[0]?.transcript?.trim();

        if (!transcript) {
          return;
        }

        setVoicePreview(transcript);

        if (event.isFinal) {
          const currentIngredients =
            useRecipeStore.getState().manualIngredients;
          setManualIngredients(appendTranscript(currentIngredients, transcript));
          setVoicePreview("");
          setIsSecondaryOpen(true);
        }
      }),
      ExpoSpeechRecognitionModule.addListener("error", (event) => {
        setIsListening(false);

        if (event.error === "aborted") {
          return;
        }

        setError(event.message || "Voice input stopped unexpectedly.");
      }),
    ];

    return speechModule;
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
            <OliveLogo size="sm" />
            <Text style={styles.title}>Add your ingredients</Text>
            <Text style={styles.copy}>
              Snap what you have and AppéFit will turn it into five healthy
              recipe ideas.
            </Text>
          </View>
          <View style={styles.photoButton}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            ) : (
              <View style={styles.photoIcon}>
                <View style={styles.photoLens} />
              </View>
            )}
            <Text style={styles.photoButtonTitle}>Take a Photo</Text>
            <Text style={styles.photoButtonCopy}>
              Fastest way to capture fridge, pantry, or counter ingredients.
            </Text>
            <View style={styles.photoActions}>
              <Pressable
                disabled={isPickingImage}
                onPress={handleTakePhoto}
                style={styles.photoActionPrimary}
              >
                <Text style={styles.photoActionPrimaryText}>
                  {isPickingImage ? "Opening..." : "Open Camera"}
                </Text>
              </Pressable>
              <Pressable
                disabled={isPickingImage}
                onPress={handleUploadPhoto}
                style={styles.photoActionSecondary}
              >
                <Text style={styles.photoActionSecondaryText}>Upload</Text>
              </Pressable>
            </View>
            {imageUri ? (
              <Pressable onPress={clearImage}>
                <Text style={styles.removeImageText}>Remove photo</Text>
              </Pressable>
            ) : null}
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
              <Button
                label={isListening ? "Stop Listening" : "Tap to Speak"}
                onPress={handleToggleDictation}
                variant="olive"
              />
              {voicePreview ? (
                <Text style={styles.voicePreview}>{voicePreview}</Text>
              ) : null}
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
          disabled={!manualIngredients.trim() && !imageUri}
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
  imagePreview: {
    width: "100%",
    height: 190,
    borderRadius: 8,
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
  photoActions: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  photoActionPrimary: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    borderRadius: 24,
    backgroundColor: "#71843d",
  },
  photoActionPrimaryText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  photoActionSecondary: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 96,
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#c8d99a",
    borderRadius: 24,
    backgroundColor: "#fbfcf7",
  },
  photoActionSecondaryText: {
    color: "#26351d",
    fontSize: 15,
    fontWeight: "800",
  },
  removeImageText: {
    color: "#71843d",
    fontSize: 14,
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
});

const imagePickerOptions: ImagePicker.ImagePickerOptions = {
  allowsEditing: true,
  aspect: [4, 3],
  base64: true,
  mediaTypes: ["images"],
  quality: 0.72,
};
