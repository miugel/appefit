import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import { generateRecipesRouter } from "./routes/generateRecipes";
import { rateLimiter, cleanupExpiredRecords } from "./middleware/rateLimiter";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 3000);

app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(rateLimiter);

// Cleanup rate limit records every 5 minutes
setInterval(cleanupExpiredRecords, 5 * 60 * 1000);

app.get("/", (_request, response) => {
  response.json({ ok: true });
});

app.use("/generate-recipe", generateRecipesRouter);

app.listen(port, () => {
  console.log(`AppéFit server listening on http://localhost:${port}`);
});
