// scripts/generateRoutes.js
import fs from "fs";
import path from "path";

const pagesDir = path.join(process.cwd(), "./src/pages");
const routesFile = path.join(process.cwd(), "./src/routes/routes.jsx");

if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });

const pageNames = fs.readdirSync(pagesDir).filter((name) =>
  fs.statSync(path.join(pagesDir, name)).isDirectory()
);

const imports = pageNames
  .map((name) => `import ${name} from "../pages/${name}/index.jsx";`)
  .join("\n");

const routesJSX = pageNames
  .map((name) => `  <Route path="/${name.toLowerCase()}" element={<${name} />} />`)
  .join("\n");

const content = `// Ce fichier est généré automatiquement
import React from "react";
import { Routes, Route } from "react-router-dom";
${imports}

export default function AppRoutes() {
  return (
    <Routes>
${routesJSX}
    </Routes>
  );
}
`;

fs.writeFileSync(routesFile, content, "utf8");
console.log("✅ Routes générées automatiquement !");
