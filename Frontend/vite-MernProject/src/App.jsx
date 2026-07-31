import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import {
    Loader2,
    CheckCircle2,
    Bookmark,
    PenLine
} from "lucide-react";

import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyOtpPage from "./pages/VerifyOtpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import CreatePollPage from "./pages/CreatePollPage";
import PollListPage from "./pages/PolListPage";
import SettingPage from "./pages/SettingPage";
import UserProfilePage from "./pages/UserProfilePage";
import SinglePollPage from "./pages/SinglePollPage";
import Connections from "./components/Connections.jsx";
import PollCard from "./components/PollCard.jsx";
import { Button } from "./components/UIElements";
import { appStyles as s } from "./assets/dummyStyles";
import { useAuth } from "./context/AuthContext";
import AnalyticsPage from "./pages/AnalyticsPage.jsx";


function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className={s.loadingContainer}>
                <Loader2 className={s.loadingSpinner} size={32} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

function App() {
    const { user } = useAuth();
    return (
        <div className={s.root} style={s.rootStyle}>
            <Routes>

                <Route
                    path="/"
                    element={<Navigate to="/login" replace />}
                />

                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route
                    path="/signup"
                    element={<Navigate to="/register" replace />}
                />
                <Route path="/verify-otp" element={<VerifyOtpPage />} />
                <Route
                    path="/forgot-password"
                    element={<ForgotPasswordPage />}
                />

                {/* Protected Routes */}
                <Route
                    element={
                        <ProtectedRoute>
                            <Layout key={user?._id || "guest"} />
                        </ProtectedRoute>
                    }
                >
                    <Route
                        index
                        element={<Navigate to="/dashboard" replace />}
                    />

                    <Route
                        path="dashboard"
                        element={<DashboardPage />}
                    />

                    <Route
                        path="create-poll"
                        element={<CreatePollPage />}
                    />

                    <Route path="/settings" element={<SettingPage />} />

                    <Route path="/poll/:id" element={<SinglePollPage />} />

                    <Route path="/user/:username" element={<UserProfilePage />} />

                    <Route path="/poll/:id/analytics" element={<AnalyticsPage />} />

                    <Route path="*" element={<Navigate to="/dashboard" replace />} />

                    <Route
                        path="my-polls"
                        element={
                            <PollListPage
                                title="My Polls"
                                path="/polls/mine"
                                owner
                                Icon={PenLine}
                                emptyTitle="No Polls Created"
                                emptyText="Create your first poll to see it here."
                                action={
                                    <Link to="/create-poll">
                                        <Button className="mt-4">
                                            Create Poll
                                        </Button>
                                    </Link>
                                }
                            />
                        }
                    />

                    <Route
                        path="voted-polls"
                        element={
                            <PollListPage
                                title="Voted Polls"
                                path="/polls/voted"
                                owner
                                Icon={CheckCircle2}
                                emptyTitle="No Votes Yet"
                                emptyText="You have not voted on any polls yet."
                            />
                        }
                    />

                    <Route
                        path="bookmarked-polls"
                        element={
                            <PollListPage
                                title="Saved Polls"
                                path="/polls/bookmarks"
                                owner
                                Icon={Bookmark}
                                emptyTitle="No Saved Polls Yet"
                                emptyText="Save polls you want to revisit later."
                                action={
                                    <Link to="/dashboard">
                                        <Button className="mt-4">
                                            Explore Polls
                                        </Button>
                                    </Link>
                                }
                            />
                        }
                    />
                </Route>

                <Route
                    path="*"
                    element={<h1>404 - Page Not Found</h1>}
                />

            </Routes>
        </div>
    );
}

export default App;