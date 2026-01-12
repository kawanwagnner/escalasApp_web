import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import { RecoveryRedirect } from "../components/auth/RecoveryRedirect";

// Auth Pages
import { Login } from "../pages/auth/Login";
import { Register } from "../pages/auth/Register";
import { ResetPassword } from "../pages/auth/ResetPassword";
import { VerifyCode } from "../pages/auth/VerifyCode";
import { UpdatePassword } from "../pages/auth/UpdatePassword";

// Main Pages
import { Dashboard } from "../pages/Dashboard";
import Ministerios from "../pages/Ministerios";
import { MinhasEscalas } from "../pages/MinhasEscalas";
import Convites from "../pages/Convites";
import { Membros } from "../pages/Membros";
import { Profile } from "../pages/Profile";
import Comunicados from "../pages/Comunicados";
import Eventos from "../pages/Eventos";
import Agenda from "../pages/Agenda";

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RecoveryRedirect>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-code" element={<VerifyCode />} />
            <Route path="/update-password" element={<UpdatePassword />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ministerios"
              element={
                <ProtectedRoute>
                  <Ministerios />
                </ProtectedRoute>
              }
            />
            <Route
              path="/minhas-escalas"
              element={
                <ProtectedRoute>
                  <MinhasEscalas />
                </ProtectedRoute>
              }
            />
            <Route
              path="/convites"
              element={
                <ProtectedRoute>
                  <Convites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/membros"
              element={
                <ProtectedRoute>
                  <Membros />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perfil"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/comunicados"
              element={
                <ProtectedRoute>
                  <Comunicados />
                </ProtectedRoute>
              }
            />
            <Route
              path="/eventos"
              element={
                <ProtectedRoute>
                  <Eventos />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agenda"
              element={
                <ProtectedRoute>
                  <Agenda />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </RecoveryRedirect>
      </AuthProvider>
    </BrowserRouter>
  );
};
