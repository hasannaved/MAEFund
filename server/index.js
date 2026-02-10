import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import sqlite3 from "sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbDir = path.join(__dirname, "data");
const dbPath = path.join(dbDir, "maefund.sqlite");

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS state (id INTEGER PRIMARY KEY, payload TEXT, updated_at TEXT)"
  );
});

const app = express();
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : [];
app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true
  })
);
app.use(express.json({ limit: "1mb" }));

const readState = () =>
  new Promise((resolve, reject) => {
    db.get("SELECT payload FROM state WHERE id = 1", (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row?.payload ? JSON.parse(row.payload) : null);
    });
  });

const writeState = (state) =>
  new Promise((resolve, reject) => {
    const payload = state ? JSON.stringify(state) : null;
    db.run(
      "INSERT OR REPLACE INTO state (id, payload, updated_at) VALUES (1, ?, datetime('now'))",
      payload,
      (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      }
    );
  });

app.get("/api/state", async (_req, res) => {
  try {
    const state = await readState();
    res.json({ state });
  } catch (error) {
    res.status(500).json({ error: "Failed to read state" });
  }
});

app.put("/api/state", async (req, res) => {
  try {
    await writeState(req.body.state ?? null);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to save state" });
  }
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

const PORT = process.env.PORT || 5174;

app.listen(PORT, () => {
  console.log(`MAEF backend listening on port ${PORT}`);
});
