# AppéFit MVP Implementation Plan

## Product Goal

Build a barebones Expo mobile app that helps users turn available ingredients into structured, weight-loss-friendly recipe ideas.

The focus of this project is not a complex UI. The focus is high-quality LLM functionality: ingredient extraction, structured recipe generation, validation, deduplication, finite refresh behavior, and clean handling when there are no more good non-duplicate options.

## Core Requirements

Users should be able to:

1. Start from a simple get started screen.
2. Add ingredients in one or more ways:
   - take or upload a photo
   - type ingredients manually
   - speak ingredients through voice input
3. Generate exactly 5 recipe suggestions.
4. Refresh to get 5 new recipe suggestions.
5. Avoid seeing repeated recipes across refreshes.
6. Stop refreshing gracefully once the app cannot produce enough new recipes.
7. Tap a recipe from the list.
8. View the full structured recipe on a detail screen.

This should not be a chat interface. Recipe suggestions and recipe details should be highly structured.

## Recommended Tech Stack

### Mobile App

- Expo
- React Native
- TypeScript
- Expo Router
- Zustand for state management
- AsyncStorage for lightweight local persistence
- `expo-image-picker` for photo capture or upload
- Voice input library:
  - preferred: `expo-speech-recognition` if compatible with the chosen Expo setup
  - fallback: `@react-native-voice/voice`

### Backend

Use a small Node/Express server.

The server owns all OpenAI calls so API keys are never exposed to the mobile app.

### LLM / Validation

- OpenAI SDK
- Vision-capable model for ingredient extraction from image
- Text/structured-output capable model for recipe generation
- Zod for schema validation
- UUID generation for recipe IDs

## Product Direction

The app should feel simple, clean, and modern, similar to Cal AI-style food tracking apps:

- Minimal screens
- Large rounded cards
- Clear primary CTA
- Lots of whitespace
- Simple typography
- Light neutral background
- Subtle borders/shadows
- No cluttered nutrition-dashboard feel
- No chat bubbles

The design should feel polished without becoming the focus of the take-home.

## App Flow

```txt
Get Started
→ Ingredient Input
   → take/upload photo
   → type ingredients
   → speak ingredients
→ Loading
→ Recipe Results
   → 5 recipe cards
   → refresh button for 5 new recipes
   → tap card for full recipe
→ Recipe Detail
```

## Screens

### 1. Get Started Screen

Path:

```txt
app/index.tsx
```

Purpose:

- Simple intro screen
- One primary CTA

Suggested copy:

```txt
Turn the ingredients you have into healthy recipes you actually want to cook.
```

CTA:

```txt
Get Started
```

Navigates to:

```txt
/input
```

---

### 2. Ingredient Input Screen

Path:

```txt
app/input.tsx
```

Purpose:

Let users provide ingredients through photo, text, voice, or any combination of the three.

Functionality:

- Pick or take a photo using `expo-image-picker`
- Show image preview if selected
- Text area for manual ingredients
- Mic button for voice input
- Voice transcript should populate or append to the text area
- User can edit transcribed text before submitting
- Submit button navigates to loading/generation flow

Important behavior:

- Text input should be the reliable fallback.
- Voice is just another way to fill the text input.
- The backend does not need to know whether ingredients came from text or voice.

Suggested UI:

```txt
Add your ingredients

[ Take or Upload Photo ]

Ingredients
[ chicken, rice, tomato, onion ]

[ Tap to Speak ]

[ Generate Recipes ]
```

Validation:

- User must provide at least one of:
  - image
  - manual text
  - voice transcript, which becomes manual text

---

### 3. Loading Screen

Path:

```txt
app/loading.tsx
```

Purpose:

Run the recipe generation request and show progress.

Suggested loading messages:

```txt
Analyzing ingredients...
Building healthy recipe ideas...
Checking for duplicates...
```

Behavior:

- Reads current input state from Zustand
- Calls backend endpoint
- Stores detected ingredients and recipes
- Stores recipe fingerprints to prevent repeats
- Navigates to `/recipes`
- Shows an error state with retry if request fails

---

### 4. Recipe Results Screen

Path:

```txt
app/recipes.tsx
```

Purpose:

Display exactly 5 structured recipe cards.

Functionality:

- Show detected ingredients as chips
- Show 5 recipe cards
- Each card navigates to recipe detail
- Bottom refresh button requests 5 new non-repeating recipes
- Disable or replace refresh with a friendly message once max refresh attempts is reached or enough unique recipes cannot be found

Recipe card fields:

```txt
Title
Short description
Total time
Difficulty
Calories
Protein
Missing ingredients
```

Bottom CTA:

```txt
Refresh for 5 new recipes
```

Refresh behavior:

- Send all previously shown recipe fingerprints to the backend.
- Backend should avoid and filter duplicates.
- Client should also dedupe defensively.
- Backend should retry generation a limited number of times.
- If fewer than 5 unique recipes can be produced, show a graceful message rather than looping forever.

---

### 5. Recipe Detail Screen

Path:

```txt
app/recipe/[id].tsx
```

Purpose:

Display the full recipe in a highly structured format.

Fields:

```txt
Title
Description
Prep time
Cook time
Total time
Servings
Difficulty
Full ingredients with quantities
Missing ingredients
Steps
Nutrition estimate
```

Do not include:

```txt
Tags
Tips
Substitutes
Separate ingredients used list
Separate owned/missing flags per ingredient
```

Keep the schema easy for the LLM to produce while still rich enough for a good recipe experience.

## Suggested File Structure

```txt
app/
  _layout.tsx
  index.tsx
  input.tsx
  loading.tsx
  recipes.tsx
  recipe/
    [id].tsx

src/
  api/
    recipes.ts
  components/
    Button.tsx
    RecipeCard.tsx
    IngredientChip.tsx
    LoadingState.tsx
    ErrorState.tsx
  store/
    recipeStore.ts
  types/
    recipe.ts
  utils/
    image.ts
    normalize.ts
    recipeFingerprint.ts
    voice.ts

server/
  index.ts
  routes/
    generateRecipes.ts
  llm/
    openai.ts
    prompts.ts
  validation/
    recipeSchema.ts
  utils/
    dedupe.ts
    normalizeIngredients.ts
```

## Data Models

Create shared or mirrored types for the frontend and backend.

```ts
export type Difficulty = "easy" | "medium" | "hard";

export type Ingredient = {
  name: string;
  confidence?: number;
};

export type RecipeIngredient = {
  name: string;
  quantity: string;
};

export type NutritionEstimate = {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
};

export type Recipe = {
  id: string;
  title: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  servings: number;
  difficulty: Difficulty;
  missingIngredients: string[];
  ingredients: RecipeIngredient[];
  steps: string[];
  nutritionEstimate: NutritionEstimate;
};
```

Notes:

- `ingredients` is the full ingredient list with quantities.
- `missingIngredients` is a simple string list for ingredients the user likely does not have.
- Do not include `tags`, `tips`, `substitutes`, `ingredientsUsed`, or per-ingredient `owned` booleans.
- Nutrition estimate should be included for every recipe because the app is oriented around healthier, weight-loss-friendly meals.

## Zustand Store

Use Zustand to keep the app simple.

```ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Recipe } from "../types/recipe";

type RecipeStore = {
  imageUri?: string;
  imageBase64?: string;
  manualIngredients: string;
  detectedIngredients: string[];
  recipes: Recipe[];
  shownRecipeFingerprints: string[];
  refreshCount: number;
  maxRefreshes: number;
  canRefresh: boolean;

  setImage: (uri: string, base64?: string) => void;
  setManualIngredients: (value: string) => void;
  setDetectedIngredients: (ingredients: string[]) => void;
  setRecipes: (recipes: Recipe[]) => void;
  addShownRecipes: (recipes: Recipe[]) => void;
  incrementRefreshCount: () => void;
  setCanRefresh: (value: boolean) => void;
  resetSession: () => void;
};
```

Suggested defaults:

```ts
refreshCount: 0,
maxRefreshes: 3,
canRefresh: true,
```

Persist only what is useful:

- current session input
- recipes
- detected ingredients
- shown recipe fingerprints
- refresh count

Avoid account/auth/history for MVP.

## Backend API

Keep the API surface small.

### `POST /recipes/generate`

Input:

```ts
{
  imageBase64?: string;
  manualIngredients?: string;
  excludeRecipeFingerprints: string[];
  refreshCount: number;
  maxRefreshes: number;
}
```

Output:

```ts
{
  detectedIngredients: string[];
  recipes: Recipe[];
  canRefresh: boolean;
  reason?: "max_refreshes_reached" | "not_enough_unique_recipes";
}
```

Why one endpoint:

- Keeps frontend simple
- Backend owns the LLM pipeline
- Backend can handle extraction, normalization, validation, dedupe, and retries in one place

Internal backend flow:

```txt
1. Receive image and/or manual ingredient text
2. If image exists, extract visible ingredients using vision model
3. Parse manual ingredients into normalized ingredient list
4. Merge image ingredients and manual ingredients
5. Normalize and dedupe ingredients
6. Generate exactly 5 weight-loss-friendly recipes
7. Validate recipes with Zod
8. Fingerprint recipes
9. Remove duplicates against excludeRecipeFingerprints
10. Retry generation up to MAX_GENERATION_RETRIES if fewer than 5 unique recipes remain
11. Return detectedIngredients, recipes, and whether refresh should still be allowed
```

## Refresh and Retry Limits

There are not infinite good recipes for a fixed ingredient set, so refresh should be intentionally limited.

Use both limits:

```ts
const MAX_REFRESHES_PER_SESSION = 3;
const MAX_GENERATION_RETRIES = 2;
```

Behavior:

- Initial generation does not count as a refresh.
- Each tap on “Refresh for 5 new recipes” increments `refreshCount`.
- If `refreshCount >= maxRefreshes`, disable refresh.
- If the backend cannot produce 5 unique recipes after `MAX_GENERATION_RETRIES`, return the best result only if it has 5 recipes. Otherwise, return a friendly exhaustion response and keep the current recipes on screen.

User-facing exhaustion message:

```txt
We could not find enough new recipes with these ingredients. Try adding more ingredients or starting a new scan.
```

This satisfies the “no repeats” requirement without pretending infinite unique recipe generation is possible.

## LLM Pipeline

### Step 1: Ingredient Extraction

Use this step only when `imageBase64` is provided.

Prompt:

```txt
You are an ingredient recognition assistant.

Analyze the image and identify visible food ingredients.

Return JSON only with this shape:
{
  "ingredients": [
    {
      "name": "string",
      "confidence": number
    }
  ]
}

Rules:
- Only include ingredients that are likely visible.
- Normalize ingredient names. For example, "roma tomato" should become "tomato".
- Do not include cookware, packaging, plates, utensils, or non-food objects.
- If uncertain, include the ingredient with lower confidence.
- Do not include any text outside the JSON object.
```

Post-processing:

- Drop ingredients below a reasonable confidence threshold, for example `0.45`
- Normalize names
- Deduplicate names
- Merge with manually typed or spoken ingredients

### Step 2: Recipe Generation

Prompt:

```txt
You are a recipe generation assistant.

Generate exactly 5 practical recipes using the available ingredients.
The recipes should be satisfying but generally supportive of losing weight: prioritize lean protein, vegetables, fiber, reasonable portions, and moderate calories. Do not make the recipes bland or overly restrictive.

Available ingredients:
{{ingredients}}

Do not generate recipes matching or closely resembling these previous recipe fingerprints or titles:
{{excludeRecipeFingerprints}}

Return JSON only with this shape:
{
  "recipes": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "prepTimeMinutes": number,
      "cookTimeMinutes": number,
      "totalTimeMinutes": number,
      "servings": number,
      "difficulty": "easy" | "medium" | "hard",
      "missingIngredients": ["string"],
      "ingredients": [
        {
          "name": "string",
          "quantity": "string"
        }
      ],
      "steps": ["string"],
      "nutritionEstimate": {
        "calories": number,
        "proteinGrams": number,
        "carbsGrams": number,
        "fatGrams": number
      }
    }
  ]
}

Rules:
- Generate exactly 5 recipes.
- Recipes should be realistic for home cooking.
- Prefer recipes that use the available ingredients.
- Missing ingredients should be common pantry or grocery items.
- Do not repeat recipe concepts.
- Do not include markdown.
- Do not include commentary.
- Do not include text outside JSON.
- Steps should be clear, ordered, and concise.
- Ingredient quantities should be practical and human-readable.
- Nutrition estimates should be per serving.
- Keep calories reasonable for a weight-loss-oriented meal unless the ingredients make that unrealistic.
```

## Zod Validation

All LLM responses must be validated before returning data to the client.

```ts
import { z } from "zod";

export const RecipeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  prepTimeMinutes: z.number().int().nonnegative(),
  cookTimeMinutes: z.number().int().nonnegative(),
  totalTimeMinutes: z.number().int().nonnegative(),
  servings: z.number().int().positive(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  missingIngredients: z.array(z.string()).default([]),
  ingredients: z.array(
    z.object({
      name: z.string().min(1),
      quantity: z.string().min(1),
    })
  ),
  steps: z.array(z.string().min(1)).min(1),
  nutritionEstimate: z.object({
    calories: z.number().nonnegative(),
    proteinGrams: z.number().nonnegative(),
    carbsGrams: z.number().nonnegative(),
    fatGrams: z.number().nonnegative(),
  }),
});

export const GenerateRecipesResponseSchema = z.object({
  recipes: z.array(RecipeSchema).length(5),
});
```

If validation fails:

1. Retry once with a repair prompt.
2. If still invalid, return a friendly error to the client.
3. Do not show raw LLM output to the user.

## Dedupe Strategy

The assignment explicitly requires recipes not to repeat from refresh to refresh.

Use a defensive two-layer approach:

1. Tell the model what to avoid.
2. Enforce dedupe in code.

### Recipe Fingerprints

```ts
export function recipeFingerprint(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\b(easy|quick|simple|homemade|best|fresh|crispy|creamy|healthy|light)\b/g, "")
    .trim()
    .replace(/\s+/g, "-");
}
```

Example:

```txt
Quick Healthy Chicken Stir-Fry → chicken-stir-fry
Easy Chicken Stir Fry → chicken-stir-fry
```

### Backend Dedupe

```ts
const uniqueRecipes = recipes.filter((recipe) => {
  const fingerprint = recipeFingerprint(recipe.title);
  return !excludeRecipeFingerprints.includes(fingerprint);
});
```

If `uniqueRecipes.length < 5`, retry generation up to `MAX_GENERATION_RETRIES` with stronger instructions and the updated exclusion list.

### Client Dedupe

The client should also update the fingerprint list after every successful generation.

```ts
addShownRecipes(recipes) {
  const newFingerprints = recipes.map((recipe) => recipeFingerprint(recipe.title));
  set((state) => ({
    shownRecipeFingerprints: Array.from(
      new Set([...state.shownRecipeFingerprints, ...newFingerprints])
    ),
  }));
}
```

## Voice Input Behavior

Voice input should not complicate the backend.

Expected behavior:

```txt
User taps mic
→ app starts listening
→ transcript appears in ingredients text box
→ user can edit transcript
→ app submits text as manualIngredients
```

Implementation notes:

- Show listening state
- Handle permission denied
- Allow user to stop recording
- Append transcript to existing manual ingredients rather than replacing them unless the input is empty

## Image Handling

Use `expo-image-picker` because it supports taking a photo and choosing from library with less setup than directly managing camera UI.

Expected behavior:

- User taps photo button
- Choose camera or library depending on implementation preference
- Store `imageUri`
- Store `base64` if possible
- Show preview
- Submit `imageBase64` to backend

Keep image upload simple for MVP. No cloud storage is needed.

## Error States

Handle these cleanly:

### No Input

```txt
Add a photo, type ingredients, or use voice before generating recipes.
```

### Image Ingredient Detection Failed

Fallback behavior:

- If manual ingredients exist, continue with manual ingredients.
- If no manual ingredients exist, ask user to type ingredients or try another photo.

### LLM Validation Failed

```txt
We had trouble formatting the recipes. Please try again.
```

### Duplicate Generation Failed / Recipe Exhaustion

```txt
We could not find enough new recipes with these ingredients. Try adding more ingredients or starting a new scan.
```

### Max Refreshes Reached

```txt
You have reached the refresh limit for these ingredients. Add more ingredients or start a new scan for more ideas.
```

### Network Error

```txt
Something went wrong. Check your connection and try again.
```

## Implementation Milestones

### Milestone 1: Project Setup

- Create Expo TypeScript app
- Add Expo Router
- Add basic screen routes
- Add Zustand store
- Add shared recipe types
- Create Node/Express server

### Milestone 2: Barebones Cal AI-Inspired UI

- Build get started screen
- Build ingredient input screen
- Build loading screen
- Build results screen with mock recipes
- Build recipe detail screen with mock data
- Use clean rounded cards, whitespace, and simple CTA styling

### Milestone 3: Input Functionality

- Add image picker
- Add text input
- Add voice input
- Store input in Zustand

### Milestone 4: Backend

- Create Express `/recipes/generate` route
- Add OpenAI client
- Add ingredient extraction prompt
- Add recipe generation prompt
- Add Zod validation
- Add dedupe, finite retry, and max refresh logic

### Milestone 5: Connect App to Backend

- Submit image/text input to backend
- Store detected ingredients and recipes
- Navigate from loading to results
- Render real recipes

### Milestone 6: Refresh Logic

- Add refresh button
- Send `excludeRecipeFingerprints`
- Send `refreshCount` and `maxRefreshes`
- Store fingerprints after every generation
- Verify recipes do not repeat
- Disable refresh once max refreshes or recipe exhaustion is reached

### Milestone 7: Polish and Reliability

- Add loading messages
- Add error states
- Add retry buttons
- Clean up UI spacing
- Test photo-only, text-only, voice-only, and combined input flows
- Test duplicate/exhaustion behavior with small ingredient sets

## Acceptance Criteria

The app is complete when:

- A user can start from the intro screen.
- A user can provide ingredients through photo, text, or voice.
- The app can generate 5 structured recipes.
- Recipes are generally weight-loss-friendly without being bland or unrealistic.
- Recipe cards are not chat bubbles.
- Recipe details are shown in a dedicated screen.
- Refresh returns 5 new recipes when possible.
- Recipes do not repeat across refreshes in the same session.
- Refresh stops gracefully after the configured max refreshes or when enough unique recipes cannot be generated.
- LLM responses are validated with Zod.
- Invalid LLM output is retried or handled gracefully.
- The OpenAI API key is never exposed in the mobile app.
- No auth or database is required for MVP.

## What Not To Build For MVP

Avoid these unless there is extra time:

- User accounts
- Saved recipe history across accounts
- Full database
- Meal planning calendar
- Grocery delivery integrations
- Complex animations
- Social sharing
- Chat interface
- Embedding-based semantic dedupe
- Substitutes
- Advanced dietary preference system

## Best Engineering Tradeoff

Keep the UI intentionally simple and spend the engineering effort on the LLM pipeline.

This project should demonstrate:

- practical mobile architecture
- thoughtful LLM prompting
- structured output handling
- schema validation
- finite retry logic
- deduplication
- product taste through a clean, non-chat experience
