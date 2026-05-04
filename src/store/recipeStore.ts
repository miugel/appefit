import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { Recipe } from "@/types/recipe";
import { recipeFingerprint } from "@/utils/recipeFingerprint";

type RecipeStore = {
  imageUri?: string;
  imageBase64?: string;
  manualIngredients: string;
  detectedIngredients: string[];
  recipeBatches: Recipe[][];
  currentBatchIndex: number;
  shownRecipeFingerprints: string[];
  refreshCount: number;
  canRefresh: boolean;
  generationError?: string;
  exhaustionReason?: "max_refreshes_reached" | "not_enough_unique_recipes";
  setImage: (uri: string, base64?: string) => void;
  clearImage: () => void;
  setManualIngredients: (value: string) => void;
  setDetectedIngredients: (ingredients: string[]) => void;
  addBatch: (recipes: Recipe[]) => void;
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
  imageUri: undefined,
  imageBase64: undefined,
  manualIngredients: "",
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
      setImage: (uri, base64) => set({ imageUri: uri, imageBase64: base64 }),
      clearImage: () => set({ imageUri: undefined, imageBase64: undefined }),
      setManualIngredients: (value) => set({ manualIngredients: value }),
      setDetectedIngredients: (ingredients) =>
        set({ detectedIngredients: ingredients }),
      addBatch: (recipes) =>
        set((state) => ({
          recipeBatches: [...state.recipeBatches, recipes],
          currentBatchIndex: state.recipeBatches.length,
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
        imageUri: state.imageUri,
        imageBase64: state.imageBase64,
        manualIngredients: state.manualIngredients,
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
