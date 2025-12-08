#!/usr/bin/env node
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import neonxConfig from "./config/neonx.config.js";
import mainRouter from "./config/router.config.js"
dotenv.config();

const app = express();
const PORT = process.env.PORT || neonxConfig.server.port || 3000;

app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send(`🚀 Backend NeonX fonctionne sur le port ${PORT}`);
});

if (neonxConfig.features.auth) {
  app.get("/login", (req, res) => {
    res.send("Page de connexion activée (auth = true)");
  });
}

app.use("/neonx", mainRouter);

app.listen(PORT, () => {
  console.log(`✅ Serveur NeonX démarré sur le port ${PORT}`);
});
