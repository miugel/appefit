import { Router } from "express";

export const generateRecipesRouter = Router();

generateRecipesRouter.post("/generate", (_request, response) => {
  response.status(501).json({
    error: "Recipe generation is implemented in milestone 4.",
  });
});
