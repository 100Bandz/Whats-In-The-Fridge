import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "./db.js";
import { requireAuth } from "./middleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

// cookie options (adjust for production)
const cookieOptions = {
  httpOnly: true,        // prevent JS access
  secure: process.env.NODE_ENV === "production", // only HTTPS in prod
  sameSite: "strict",    // prevent CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Signup
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const stmt = db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
    const result = stmt.run(email, hashed);

    const token = jwt.sign({ id: result.lastInsertRowid, email }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, cookieOptions);
    res.json({ message: "Signup successful" });
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return res.status(400).json({ error: "Email already registered" });
    }
    console.error("Signup error:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  try {
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    const same = await bcrypt.compare(password, user.password_hash);
    if (!same) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, email: user.email, isAdmin: !!user.isAdmin }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, cookieOptions);
    res.json({ message: "Login successful" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// Logout (clear cookie)
router.post("/logout", (req, res) => {
  res.clearCookie("token", cookieOptions);
  res.json({ message: "Logged out" });
  // res.json({ success: true });

});

// Current user info
router.get('/me', requireAuth, (req, res) => {
  // req.user is set by requireAuth middleware
  res.json({ id: req.user.id, email: req.user.email, isAdmin: !!req.user.isAdmin })
})

export default router;
