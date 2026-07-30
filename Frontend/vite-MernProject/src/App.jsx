import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

import { appStyles as s } from "./assets/dummyStlyes";
import { useAuth } from "./context/AuthContext";

// Protected Route
function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    // Show loader while checking authentication
    if (loading) {
        return (
            <div className={s.loadingContainer}>
                <Loader2 className={s.loadingSpinner} size={32} />
            </div>
        );
    }

    // If not logged in, redirect to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // If logged in, render protected content
    return children;
}

function App() {
    return (
        <Routes>
            {/* Default Route */}
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/signup" element={<Navigate to="/register" replace />} />
            <Route path="/verify-otp" element={<VerifyOtpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected Routes */}
            <Route element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }
            >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<h1>404 - Page Not Found</h1>} />
        </Routes>
    );
}

export default App;