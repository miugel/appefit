import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Recipe } from "@/types/recipe";
import { recipeFingerprint } from "@/utils/recipeFingerprint";

type RecipeStore = {
  imageUris: string[];
  imageBase64s: string[];
  manualIngredients: string;
  correctionContext: string;
  detectedIngredients: string[];
  recipeBatches: Recipe[][];
  currentBatchIndex: number;
  shownRecipeFingerprints: string[];
  refreshCount: number;
  canRefresh: boolean;
  generationError?: string;
  exhaustionReason?: "max_refreshes_reached" | "not_enough_unique_recipes";
  addImage: (uri: string, base64?: string) => void;
  addImages: (images: Array<{ uri: string; base64?: string }>) => void;
  removeImage: (index: number) => void;
  clearImages: () => void;
  setManualIngredients: (value: string) => void;
  setCorrectionContext: (value: string) => void;
  setDetectedIngredients: (ingredients: string[]) => void;
  addBatch: (recipes: Recipe[]) => void;
  replaceBatch: (recipes: Recipe[]) => void;
  goToNextBatch: () => void;
  goToPreviousBatch: () => void;
  addShownRecipes: (recipes: Recipe[]) => void;
  incrementRefreshCount: () => void;
  setCanRefresh: (value: boolean) => void;
  setGenerationError: (message?: string) => void;
  setExhaustionReason: (
    reason?: "max_refreshes_reached" | "not_enough_unique_recipes",
  ) => void;
  startNewGeneration: () => void;
  resetSession: () => void;
};

const initialState = {
  imageUris: [],
  imageBase64s: [],
  manualIngredients: "",
  correctionContext: "",
  detectedIngredients: [],
  recipeBatches: [],
  currentBatchIndex: 0,
  shownRecipeFingerprints: [],
  refreshCount: 0,
  canRefresh: true,
  generationError: undefined,
  exhaustionReason: undefined,
};

export const useRecipeStore = create<RecipeStore>()(
  persist(
    (set) => ({
      ...initialState,
      addImage: (uri, base64) =>
        set((state) => ({
          imageUris: [...state.imageUris, uri],
          imageBase64s: [...state.imageBase64s, base64 ?? ""],
        })),
      addImages: (images) =>
        set((state) => ({
          imageUris: [
            ...state.imageUris,
            ...images.map((image) => image.uri),
          ],
          imageBase64s: [
            ...state.imageBase64s,
            ...images.map((image) => image.base64 ?? ""),
          ],
        })),
      removeImage: (index) =>
        set((state) => ({
          imageUris: state.imageUris.filter((_, i) => i !== index),
          imageBase64s: state.imageBase64s.filter((_, i) => i !== index),
        })),
      clearImages: () => set({ imageUris: [], imageBase64s: [] }),
      setManualIngredients: (value) => set({ manualIngredients: value }),
      setCorrectionContext: (value) => set({ correctionContext: value }),
      setDetectedIngredients: (ingredients) =>
        set({ detectedIngredients: ingredients }),
      addBatch: (recipes) =>
        set((state) => ({
          recipeBatches: [...state.recipeBatches, recipes],
          currentBatchIndex: state.recipeBatches.length,
        })),
      replaceBatch: (recipes) =>
        set((state) => ({
          recipeBatches: state.recipeBatches.map((batch, i) =>
            i === state.currentBatchIndex ? recipes : batch,
          ),
        })),
      goToNextBatch: () =>
        set((state) => ({
          currentBatchIndex: Math.min(
            state.currentBatchIndex + 1,
            state.recipeBatches.length - 1,
          ),
        })),
      goToPreviousBatch: () =>
        set((state) => ({
          currentBatchIndex: Math.max(state.currentBatchIndex - 1, 0),
        })),
      addShownRecipes: (recipes) =>
        set((state) => ({
          shownRecipeFingerprints: Array.from(
            new Set([
              ...state.shownRecipeFingerprints,
              ...recipes.map((recipe) => recipeFingerprint(recipe.title)),
            ]),
          ),
        })),
      incrementRefreshCount: () =>
        set((state) => ({ refreshCount: state.refreshCount + 1 })),
      setCanRefresh: (value) => set({ canRefresh: value }),
      setGenerationError: (message) => set({ generationError: message }),
      setExhaustionReason: (reason) => set({ exhaustionReason: reason }),
      startNewGeneration: () =>
        set({
          detectedIngredients: [],
          correctionContext: "",
          recipeBatches: [],
          currentBatchIndex: 0,
          shownRecipeFingerprints: [],
          refreshCount: 0,
          canRefresh: true,
          generationError: undefined,
          exhaustionReason: undefined,
        }),
      resetSession: () => set(initialState),
    }),
    {
      name: "appefit-session",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        imageUris: state.imageUris,
        imageBase64s: state.imageBase64s,
        manualIngredients: state.manualIngredients,
        correctionContext: state.correctionContext,
        detectedIngredients: state.detectedIngredients,
        recipeBatches: state.recipeBatches,
        currentBatchIndex: state.currentBatchIndex,
        shownRecipeFingerprints: state.shownRecipeFingerprints,
        refreshCount: state.refreshCount,
        canRefresh: state.canRefresh,
        generationError: state.generationError,
        exhaustionReason: state.exhaustionReason,
      }),
    },
  ),
);
