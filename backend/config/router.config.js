import express from "express";
import neonxConfig from "./neonx.config.js";
import fs from "fs";
import path from "path";

const router = express.Router();

// Route pour afficher les configuration du setup Neonx
router.get("/config", (req, res) => {
  res.json({
    message: "🧠 Configuration active du framework NeonX",
    config: neonxConfig,
  });
});

// Route pour config DB
router.get("/db-config", (req, res) => {
  const dbPath = path.join(process.cwd(), "db.config.json");
  if (!fs.existsSync(dbPath))
    return res.status(404).json({ error: "DB config introuvable" });
  const data = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  res.json(data);
});

// Modification du fichier db
router.post("/db-config", (req, res) => {
  const dbPath = path.join(process.cwd(), "db.config.json");
  fs.writeFileSync(dbPath, JSON.stringify(req.body, null, 2), "utf8");
  res.json({ message: "DB config mise à jour avec succès !" });
});

export default router;
