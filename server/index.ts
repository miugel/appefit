import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { generateRecipesRouter } from "./routes/generateRecipes";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.use("/recipes", generateRecipesRouter);

app.listen(port, () => {
  console.log(`RecipeSnap server listening on http://localhost:${port}`);
});
