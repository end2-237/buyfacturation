#!/usr/bin/env node
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import neonxConfig from "./config/neonx.config.js";
import mainRouter from "./config/router.config.js";
import invoiceRouter from "./routes/invoice.routes.js";
import { connectDB } from "./db/mongoose.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || neonxConfig.server.port || 3000;

const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",")
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
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
app.use("/api/invoices", invoiceRouter);

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({ error: err.message || "Erreur interne" });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Serveur NeonX démarré sur le port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Impossible de se connecter à MongoDB :", err.message);
    process.exit(1);
  });
