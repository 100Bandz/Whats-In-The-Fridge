import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import db from "./db.js";
import authRoutes from "./auth.js";
import pantryRoutes from "./pantry.js";
import recipeRoutes from "./recipes.js";
import { requireAuth } from "./middleware.js";
import { callRecipeModel } from "./recipeHelper.js";
import adminRoutes from "./admin.js";
import cookieParser from "cookie-parser";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/pantry", pantryRoutes);
app.use("/api/recipes", recipeRoutes);

// Admin dashboard routes
app.use("/api/admin", adminRoutes);


// Recipe generator
app.post("/api/recipes/generate", requireAuth, async (req, res) => {
  const { ingredients, cuisine, mealType, dietType, difficulty, language } = req.body;

  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: "Ingredients must be a non-empty array." });
  }

  try {
    const recipes = await callRecipeModel({
      mode: "generate",
      ingredients,
      cuisine,
      mealType,
      dietType,
      difficulty,
      language,
      endpoint: "/api/recipes/generate",
      userId: req.user.id,
    });

    res.json({ recipes });
  } catch (err) {
    console.error("Generate error:", err.message);
    res.status(500).json({ error: "Failed to generate recipes." });
  }
});

// Recipe suggest generator
app.post("/api/recipes/suggest", requireAuth, async (req, res) => {
  const { ingredients, cuisine, mealType, dietType, difficulty, language } = req.body;

  if (!ingredients || !Array.isArray(ingredients)) {
    return res.status(400).json({ error: "Ingredients must be an array." });
  }

  try {
    const recipes = await callRecipeModel({
      mode: "suggest",
      ingredients,
      cuisine,
      mealType,
      dietType,
      difficulty,
      language,
      endpoint: "/api/recipes/suggest",
      userId: req.user.id,
    });

    res.json({ recipes });
  } catch (err) {
    console.error("Suggest error:", err.message);
    res.status(500).json({ error: "Failed to suggest recipes." });
  }
});

app.get("/", (req, res) => {
  res.send("Recipe Generator Backend is running.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
