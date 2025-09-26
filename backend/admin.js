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

export default router;
