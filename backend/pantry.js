import express from "express";
import db from "./db.js";
import { requireAuth } from "./middleware.js";

const router = express.Router();

// Get all pantry ingredients for logged-in user
router.get("/", requireAuth, (req, res) => {
  try {
    const stmt = db.prepare("SELECT ingredient FROM pantry WHERE user_id = ?");
    const rows = stmt.all(req.user.id);
    res.json({ ingredients: rows.map(r => r.ingredient) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new ingredients (accepts array)
router.post("/", requireAuth, (req, res) => {
  const { ingredients } = req.body;
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: "Ingredients must be a non-empty array." });
  }

  try {
    const insertStmt = db.prepare(
      "INSERT OR IGNORE INTO pantry (user_id, ingredient) VALUES (?, ?)"
    );
    const insertMany = db.transaction((ingredients) => {
      for (const ing of ingredients) {
        insertStmt.run(req.user.id, ing.trim());
      }
    });

    insertMany(ingredients);

    // Return updated pantry
    const rows = db.prepare("SELECT ingredient FROM pantry WHERE user_id = ?").all(req.user.id);
    res.json({ ingredients: rows.map(r => r.ingredient) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Remove an ingredient
router.delete("/:ingredient", requireAuth, (req, res) => {
  const ingredient = req.params.ingredient;
  if (!ingredient) return res.status(400).json({ error: "Ingredient required" });

  try {
    const stmt = db.prepare("DELETE FROM pantry WHERE user_id = ? AND ingredient = ?");
    stmt.run(req.user.id, ingredient);

    // Return updated pantry
    const rows = db.prepare("SELECT ingredient FROM pantry WHERE user_id = ?").all(req.user.id);
    res.json({ ingredients: rows.map(r => r.ingredient) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
