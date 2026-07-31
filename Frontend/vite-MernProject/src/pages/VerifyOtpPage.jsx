import React from "react";
import { verifyOtpStyles as s } from "../assets/dummyStyles";
import AuthLayout from "../components/AuthLayout";
import OtpStep from "../components/OtpStep";
import { Navigate, useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const VerifyOtpPage = () => {
    const { verifyOtp, resendOtp } = useAuth();
    const navigate = useNavigate();
    const email = useLocation().state?.email;

    if (!email) return <Navigate to="/register" replace />;

    // Submit OTP
    const submit = async (otp) => {
        await verifyOtp({ email, otp });
        navigate("/login", { state: { verified: true } });
    };

    return (
        <AuthLayout
            title="Check your inbox"
            subtitle="We sent a 6-digit code to verify your email address"
        >
            <OtpStep
                email={email}
                onSubmit={submit}
                onResend={() => resendOtp({ email })}
                submitText="Verify Email"
            />

            <p className={s.footerText}>
                Wrong email?{" "}
                <Link to="/register" className={s.link}>
                    Go Back
                </Link>
            </p>
        </AuthLayout>
    );
};

export default VerifyOtpPage;