import React from "react";
import { Routes, Route } from "react-router-dom";
import ConfigPage from "./pages/config";
import DbConfigPage from "./pages/DbConfigPage";
import { ProtectedRoute } from "./auth";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route
        path="/neon.admin/config"
        element={
          <ProtectedRoute>
            <ConfigPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/neon.admin/db-config"
        element={
          <ProtectedRoute>
            <DbConfigPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
