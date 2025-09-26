import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "./db.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key";

// Signup
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const stmt = db.prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)");
    const result = stmt.run(email, hashed);

    const token = jwt.sign({ id: result.lastInsertRowid, email }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
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

    // Include isAdmin in the token
    const token = jwt.sign({ id: user.id, email: user.email, isAdmin: !!user.isAdmin }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, email: user.email, isAdmin: !!user.isAdmin } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});


export default router;
