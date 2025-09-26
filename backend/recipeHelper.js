import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { OpenAI } from "openai";
import db from "./db.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, ".env") });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function callRecipeModel({ mode, ingredients, cuisine, mealType, dietType, difficulty, language, endpoint, userId }) {
  const timestamp = new Date().toISOString();

  const systemMessage = mode === "generate"
    ? `You are a professional chef specializing in ${cuisine || "world"} cuisine. 
      Only create recipes that use authentic ingredients, flavors, and techniques from ${cuisine || "world"} food. 
      Always respond in ${language || "English"}, and always return valid JSON following the requested schema.`
    : `You are a creative chef specializing in ${cuisine || "global"} cuisine. 
      Suggest recipes based on available ingredients but allow adding common pantry staples 
      (oil, salt, pepper, butter, garlic, etc.). Always respond in ${language || "English"} 
      and return valid JSON.`;

  const userMessage = mode === "generate"
    ? `Create 3 ${cuisine || "world"} recipes using only these ingredients: ${ingredients.join(", ")}. Each recipe must: - Be suitable for: ${mealType || "any meal"}, - Match the diet type: ${dietType || "any"}, - Have a difficulty of "${difficulty || "easy"}" or easier
      Return JSON in the following exact format:
      [
        {
          "name": "Meal Name",
          "cuisine": "${cuisine || "world"}",
          "dietType": "${dietType || "any"}",
          "mealType": "${mealType || "any"}",
          "difficulty": "easy | medium | hard",
          "prepTime": "XX minutes",
          "ingredients": [],
          "steps": []
        }
      ]`
    : `Create 3 ${mealType || ""} recipes inspired by these ingredients: ${ingredients.join(", ")}. Each recipe must: - Match the diet type: ${dietType || "any"}, - Have a difficulty of "${difficulty || "easy"}" or easier, - Use provided ingredients wherever possible, but you may add extras.
      Return JSON in this exact format:
      [
        {
          "name": "Meal Name",
          "steps": []
        }
      ]`;

  let aiResponse = null;
  let errorMessage = null;
  let recipes = [];

  try {
    const response = await openai.chat.completions.create({
    // const response = await openai.responses.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
    });

    aiResponse = response.choices[0].message.content;

    try {
      recipes = JSON.parse(aiResponse);
    } catch (parseErr) {
      errorMessage = `JSON parse error: ${parseErr.message}`;
    }

  } catch (err) {
    errorMessage = err.message;
  }

  // Save log to DB
  db.prepare(`
    INSERT INTO api_logs (endpoint, mode, user_id, payload, messages, ai_response, error)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    endpoint || "",
    mode || "",
    userId || null,
    JSON.stringify({ ingredients, cuisine, mealType, dietType, difficulty, language }),
    JSON.stringify({ systemMessage, userMessage }),
    aiResponse,
    errorMessage
  );

  if (errorMessage) throw new Error(errorMessage);

  return recipes;
}
