import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import rateLimit from "express-rate-limit";
import { ipKeyGenerator } from "express-rate-limit";
import db from "./db.js";
import authRoutes from "./auth.js";
import pantryRoutes from "./pantry.js";
import recipeRoutes from "./recipes.js";
import { requireAuth } from "./middleware.js";
import { callRecipeModel } from "./recipeHelper.js";
import adminRoutes from "./admin.js";
import cookieParser from "cookie-parser";
import { dirname } from "path";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 attempts per 5 minutes
  message: { error: "Too many authentication attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per user
  message: { error: "Too many requests, please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.user?.id?.toString() || ipKeyGenerator(req, res);
  },
  skip: (req) => {
    return !req.user;
  }
});

// Stricter limiter for AI recipe generation (more expensive operations)
const recipeGenerationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 3, // 3 recipe generations per minute per user
  message: { error: "Too many recipe generation requests, please wait a moment." },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    return req.user?.id?.toString() || ipKeyGenerator(req, res);
  },
});

// Routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/pantry", apiLimiter, pantryRoutes);
app.use("/api/recipes", apiLimiter, recipeRoutes);
app.use("/api/admin", apiLimiter, adminRoutes);

// Recipe generator
app.post("/api/recipes/generate", requireAuth, recipeGenerationLimiter, async (req, res) => {
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
app.post("/api/recipes/suggest", requireAuth, recipeGenerationLimiter, async (req, res) => {
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

if (process.env.NODE_ENV === "production") {
  const vueDistPath = path.join(__dirname, "dist");
  app.use(express.static(vueDistPath));

  app.use((req, res) => {
    res.sendFile(path.join(vueDistPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Backend running in development mode.");
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend + Frontend running on http://localhost:${PORT}`);
});