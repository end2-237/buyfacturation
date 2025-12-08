import dotenv from "dotenv";
dotenv.config(); 

export default {
  server: {
    port: process.env.PORT || 3000,
    mode: process.env.NODE_ENV || "development",
  },

  database: {
    type: process.env.DB_TYPE || "mongodb",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 27017,
    name: process.env.DB_NAME || "neonx_db",
    user: process.env.DB_USER || "",
    password: process.env.DB_PASSWORD || "",
  },

  features: {
    auth: process.env.FEATURE_AUTH === "true",
    dashboard: process.env.FEATURE_DASHBOARD === "true",
    forms: process.env.FEATURE_FORMS === "true",
    notifications: process.env.FEATURE_NOTIFICATIONS === "true",
  },

  frontend: {
    theme: process.env.FRONTEND_THEME || "default",
    pages: process.env.FRONTEND_PAGES
      ? process.env.FRONTEND_PAGES.split(",").map((p) => p.trim())
      : ["Accueil", "About", "Discover", "Services", "Contact"],
  },
};
