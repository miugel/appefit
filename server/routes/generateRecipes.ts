import { randomUUID } from "node:crypto";

import { Router } from "express";
import { zodResponseFormat } from "openai/helpers/zod";

import { recipeFingerprint } from "../../src/utils/recipeFingerprint";
import { createOpenAIClient } from "../llm/openai";
import {
  buildRecipeGenerationPrompt,
  ingredientExtractionPrompt,
} from "../llm/prompts";
import { uniqueNonExcludedRecipes } from "../utils/dedupe";
import { normalizeIngredients } from "../utils/normalizeIngredients";
import {
  GenerateRecipesApiResponseSchema,
  GenerateRecipesRequestSchema,
  GenerateRecipesResponseSchema,
  IngredientExtractionResponseSchema,
  type ServerRecipe,
} from "../validation/recipeSchema";

const MAX_GENERATION_RETRIES = 2;
const MAX_REFRESHES_PER_SESSION = 3;
const MAX_MISSING_INGREDIENTS_PER_RECIPE = 3;
const IMAGE_CONFIDENCE_THRESHOLD = 0.45;

const textModel = process.env.OPENAI_TEXT_MODEL ?? "gpt-5.4-mini";
const visionModel = process.env.OPENAI_VISION_MODEL ?? textModel;

export const generateRecipesRouter = Router();

generateRecipesRouter.post("/", async (request, response) => {
  const parsedRequest = GenerateRecipesRequestSchema.safeParse(request.body);

  if (!parsedRequest.success) {
    response.status(400).json({
      error: "Invalid recipe generation request.",
      details: parsedRequest.error.flatten(),
    });
    return;
  }

  const input = parsedRequest.data;
  const imageBase64s = input.imageBase64s?.filter((image) => image.trim());

  if (input.refreshCount > MAX_REFRESHES_PER_SESSION) {
    response.json(
      GenerateRecipesApiResponseSchema.parse({
        detectedIngredients: normalizeIngredients([input.manualIngredients ?? ""]),
        recipes: [],
        canRefresh: false,
        reason: "max_refreshes_reached",
      }),
    );
    return;
  }

  try {
    const detectedIngredients = await detectIngredients({
      imageBase64s,
      manualIngredients: input.manualIngredients,
    });

    if (!detectedIngredients.length) {
      response.status(422).json({
        error:
          "We could not detect ingredients. Add more text ingredients or try another photo.",
      });
      return;
    }

    const excludedFingerprints = new Set(input.excludeRecipeFingerprints);
    const uniqueRecipes: ServerRecipe[] = [];

    for (let attempt = 0; attempt <= MAX_GENERATION_RETRIES; attempt += 1) {
      const batch = await generateRecipeBatch({
        ingredients: detectedIngredients,
        excludeRecipeFingerprints: Array.from(excludedFingerprints),
        attempt,
      }).then(filterRecipesByMissingIngredientLimit);

      const candidates = uniqueNonExcludedRecipes(
        batch,
        Array.from(excludedFingerprints),
      );

      for (const recipe of candidates) {
        const fingerprint = recipeFingerprint(recipe.title);

        if (excludedFingerprints.has(fingerprint)) {
          continue;
        }

        uniqueRecipes.push(recipe);
        excludedFingerprints.add(fingerprint);

        if (uniqueRecipes.length === 5) {
          break;
        }
      }

      if (uniqueRecipes.length === 5) {
        break;
      }
    }

    if (uniqueRecipes.length < 5) {
      response.json(
        GenerateRecipesApiResponseSchema.parse({
          detectedIngredients,
          recipes: uniqueRecipes,
          canRefresh: false,
          reason: "not_enough_unique_recipes",
        }),
      );
      return;
    }

    response.json(
      GenerateRecipesApiResponseSchema.parse({
        detectedIngredients,
        recipes: uniqueRecipes,
        canRefresh: input.refreshCount < MAX_REFRESHES_PER_SESSION,
        reason:
          input.refreshCount >= MAX_REFRESHES_PER_SESSION
            ? "max_refreshes_reached"
            : undefined,
      }),
    );
  } catch (error) {
    console.error("Recipe generation failed", error);
    response.status(502).json({
      error: "We had trouble formatting the recipes. Please try again.",
    });
  }
});

async function detectIngredients({
  imageBase64s,
  manualIngredients,
}: {
  imageBase64s?: string[];
  manualIngredients?: string;
}) {
  const manualIngredientList = normalizeIngredients([manualIngredients ?? ""]);

  if (!imageBase64s?.length) {
    return manualIngredientList;
  }

  try {
    const perImageIngredients = await Promise.all(
      imageBase64s.map((imageBase64) => extractIngredientsFromImage(imageBase64)),
    );

    const allExtracted = perImageIngredients.flat();
    return normalizeIngredients([...manualIngredientList, ...allExtracted]);
  } catch (error) {
    if (manualIngredientList.length) {
      return manualIngredientList;
    }

    throw error;
  }
}

async function extractIngredientsFromImage(imageBase64: string) {
  const client = createOpenAIClient();
  const completion = await client.chat.completions.create({
    model: visionModel,
    messages: [
      {
        role: "system",
        content: ingredientExtractionPrompt,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract visible food ingredients from this image.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    response_format: zodResponseFormat(
      IngredientExtractionResponseSchema,
      "ingredient_extraction",
    ),
  });

  return IngredientExtractionResponseSchema.parse(
    JSON.parse(completion.choices[0]?.message.content ?? "{}"),
  ).ingredients
    .filter(
      (ingredient) =>
        ingredient.confidence === null ||
        ingredient.confidence === undefined ||
        ingredient.confidence >= IMAGE_CONFIDENCE_THRESHOLD,
    )
    .map((ingredient) => ingredient.name);
}

async function generateRecipeBatch({
  ingredients,
  excludeRecipeFingerprints,
  attempt,
}: {
  ingredients: string[];
  excludeRecipeFingerprints: string[];
  attempt: number;
}) {
  const client = createOpenAIClient();
  const completion = await client.chat.completions.create({
    model: textModel,
    messages: [
      {
        role: "system",
        content:
          "Return valid JSON only. The JSON must match the requested schema exactly.",
      },
      {
        role: "user",
        content: buildRecipeGenerationPrompt({
          ingredients,
          excludeRecipeFingerprints,
          attempt,
          maxMissingIngredients: MAX_MISSING_INGREDIENTS_PER_RECIPE,
        }),
      },
    ],
    response_format: zodResponseFormat(
      GenerateRecipesResponseSchema,
      "recipe_generation",
    ),
  });

  const parsedResponse = GenerateRecipesResponseSchema.parse(
    JSON.parse(completion.choices[0]?.message.content ?? "{}"),
  );

  return parsedResponse.recipes.map((recipe) => ({
    ...recipe,
    id: randomUUID(),
    totalTimeMinutes:
      recipe.totalTimeMinutes ||
      recipe.prepTimeMinutes + recipe.cookTimeMinutes,
  }));
}

function filterRecipesByMissingIngredientLimit(recipes: ServerRecipe[]) {
  return recipes.filter(
    (recipe) =>
      recipe.missingIngredients.length <= MAX_MISSING_INGREDIENTS_PER_RECIPE,
  );
}
