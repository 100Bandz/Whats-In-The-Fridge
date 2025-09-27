import express from "express";
import db from "./db.js";
import { requireAuth } from "./middleware.js";

const router = express.Router();

// Only allow admin users
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// View all API logs
router.get("/logs", requireAuth, requireAdmin, (req, res) => {
  const rows = db.prepare("SELECT * FROM api_logs ORDER BY createdAt DESC").all();
  res.json({ logs: rows });
});

// View health info
router.get("/health", requireAuth, requireAdmin, (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// List all available routes
router.get("/routes", requireAuth, requireAdmin, (req, res) => {
  const routes = [
    { method: "POST", path: "/api/recipes/generate" },
    { method: "POST", path: "/api/recipes/suggest" },
    { method: "GET", path: "/api/pantry" },
    { method: "POST", path: "/api/pantry" },
    { method: "DELETE", path: "/api/pantry/:ingredient" },
    { method: "GET", path: "/api/recipes/saved" },
    { method: "POST", path: "/api/recipes/saved" },
    { method: "DELETE", path: "/api/recipes/saved/:id" },
  ];
  res.json({ routes });
});


// Make user admin
router.post('/make-admin/:id', requireAuth, requireAdmin, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  const { id } = req.params
  try {
    const stmt = db.prepare('UPDATE users SET isAdmin = 1 WHERE id = ?')
    const result = stmt.run(id)
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ success: true })
  } catch (err) {
    console.error('Make admin error:', err)
    res.status(500).json({ error: 'Failed to promote user' })
  }
})

// Demote admin -> regular user
router.post('/demote-admin/:id', requireAuth, requireAdmin, (req, res) => {
  const { id } = req.params
  try {
    const stmt = db.prepare('UPDATE users SET isAdmin = 0 WHERE id = ?')
    const result = stmt.run(id)
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ success: true })
  } catch (err) {
    console.error('Demote admin error:', err)
    res.status(500).json({ error: 'Failed to demote user' })
  }
})

// Delete a user
router.delete('/users/:id', requireAuth, requireAdmin, (req, res) => {
  const { id } = req.params
  try {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?')
    const result = stmt.run(id)
    if (result.changes === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ success: true })
  } catch (err) {
    console.error('Delete user error:', err)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})



export default router;
