import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyOtpPage from './pages/VerifyOtpPage'
import ForgotpasswordPage from './pages/ForgotPasswordPage'


function App() {
    return (
        <div>
            <Routes>
                <Route path="/login" element={<LoginPage />}></Route>
                <Route path="/register" element={<RegisterPage />}></Route>
                <Route path="/signup" element={<Navigate to="/register" replace />}></Route>
                <Route path="/verify-otp" element={<VerifyOtpPage />}></Route>
                <Route path="/forgot-password" element={<ForgotpasswordPage />}></Route>

                <Route element={<Layout />}>
                    <Route path="/dashboard" element={<DashboardPage />}></Route>
                </Route>
            </Routes>
        </div>
    )
}

export default App