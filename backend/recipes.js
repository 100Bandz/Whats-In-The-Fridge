import express from "express"
import db from "./db.js"
import { requireAuth } from "./middleware.js"

const router = express.Router()

// Save a recipe
router.post("/", requireAuth, (req, res) => {
  const { name, steps } = req.body
  if (!name || !steps) {
    return res.status(400).json({ error: "Missing fields" })
  }

  const stmt = db.prepare(`
    INSERT INTO recipes (user_id, name, steps)
    VALUES (?, ?, ?)
  `)
  stmt.run(req.user.id, name, JSON.stringify(steps))

  res.json({ success: true })
})

// Get saved recipes
router.get("/", requireAuth, (req, res) => {
  const rows = db.prepare(`
    SELECT id, name, steps, createdAt
    FROM recipes
    WHERE user_id = ?
    ORDER BY createdAt DESC
  `).all(req.user.id)

  const recipes = rows.map(r => ({
    id: r.id,
    name: r.name,
    steps: JSON.parse(r.steps),
    createdAt: r.createdAt,
  }))

  res.json({ recipes })
})

// Delete a recipe
router.delete("/:id", requireAuth, (req, res) => {
  db.prepare("DELETE FROM recipes WHERE id = ? AND user_id = ?")
    .run(req.params.id, req.user.id)

  res.json({ success: true })
})

export default router
