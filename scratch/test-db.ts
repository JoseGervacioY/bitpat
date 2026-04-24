// @ts-nocheck
import { db, pool } from "../lib/db";
import dotenv from "dotenv";
import path from "path";

// Load .env from root
dotenv.config({ path: path.join(__dirname, "../.env") });

async function testConnection() {
  console.log("Testing MySQL Connection...");
  console.log("Config:", {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME
  });

  try {
    const [rows] = await pool.execute("SELECT 1 as connected");
    console.log("Connection Success:", rows);

    const user = await db.findUserByEmail("user@bitpat.com");
    if (user) {
      console.log("User found in real DB:", user.name);
    } else {
      console.log("User NOT found. Make sure you ran bitpat-database.sql");
    }

    const portfolio = await db.getPortfolioByUserId(1);
    console.log(`Found ${portfolio.length} portfolio items for user 1.`);

  } catch (err) {
    console.error("Connection Failed:", err);
  } finally {
    await pool.end();
    process.exit();
  }
}

testConnection();
