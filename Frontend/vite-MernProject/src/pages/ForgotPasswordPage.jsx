import React, { useState } from "react";
import { forgotPasswordStyles as s } from "../assets/dummyStlyes";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import OtpStep from "../components/OtpStep";
import AuthLayout from "../components/AuthLayout";
import { authInputCls, AuthButton } from "../components/UIElements";
import { AlertCircle, Eye, EyeOff } from "lucide-react";


const ForgotPasswordPage = () => {
    const { forgotPassword, verifyResetOtp, resetPassword } = useAuth();

    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [pw, setPw] = useState("");
    const [pw2, setPw2] = useState("");
    const [showPw, setShowPw] = useState(false);

    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const titles = [
        "Reset your password",
        "Check your inbox",
        "Create new password",
    ];

    const subtitles = [
        "Enter your email and we'll send you a reset code.",
        "Enter the 6-digit code sent to your email.",
        "Choose a strong new password.",
    ];

    // STEP 1
    const sendCode = async (e) => {
        e.preventDefault();

        setError("");
        setBusy(true);

        try {
            await forgotPassword({ email });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || "Could not send reset code.");
        } finally {
            setBusy(false);
        }
    };

    // STEP 2
    const verify = async (code) => {
        try {
            await verifyResetOtp({
                email,
                otp: code,
            });

            setOtp(code);
            setStep(3);
        } catch (err) {
            throw err;
        }
    };

    // STEP 3
    const reset = async (e) => {
        e.preventDefault();

        setError("");

        if (pw !== pw2) {
            setError("Passwords do not match.");
            return;
        }

        setBusy(true);

        try {
            await resetPassword({
                email,
                otp,
                password: pw,
            });

            alert("Password reset successfully.");

            navigate("/login", {
                state: {
                    reset: true,
                },
            });
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Could not reset password."
            );
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthLayout
            title={titles[step - 1]}
            subtitle={subtitles[step - 1]}
        >
            {/* Progress */}
            <div className={s.stepContainer}>
                {[1, 2, 3].map((num) => (
                    <div
                        key={num}
                        className={`${s.stepItemWrapper} ${num < 3 ? "flex-1" : ""}`}
                    >
                        <div
                            className={`${s.stepCircleBase}
              ${num < step
                                    ? s.stepCircleDone
                                    : num === step
                                        ? s.stepCircleActive
                                        : s.stepCircleInactive
                                }`}
                        >
                            {num < step ? "✓" : num}
                        </div>

                        {num < 3 && (
                            <div
                                className={`${s.stepLineBase} ${num < step
                                    ? s.stepLineDone
                                    : s.stepLineInactive
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {error && (
                <div className={s.errorBox}>
                    <AlertCircle
                        size={16}
                        className={s.errorIcon}
                    />
                    <p className={s.errorText}>{error}</p>
                </div>
            )}

            {/* STEP 1 */}

            {step === 1 && (
                <form
                    onSubmit={sendCode}
                    className={s.emailForm}
                >
                    <div className={s.emailInputWrapper}>
                        <label className={s.label}>
                            Email Address
                        </label>

                        <input
                            type="email"
                            required
                            className={authInputCls}
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />
                    </div>

                    <AuthButton disabled={busy}>
                        {busy ? "Sending..." : "Send Reset Code"}
                    </AuthButton>
                </form>
            )}

            {/* STEP 2 */}

            {step === 2 && (
                <OtpStep
                    email={email}
                    onSubmit={verify}
                    onResend={() => forgotPassword({ email })}
                    submitText="Verify Code"
                />
            )}

            {/* STEP 3 */}

            {step === 3 && (
                <form
                    onSubmit={reset}
                    className="space-y-5"
                >
                    <div>
                        <label className={s.label}>
                            New Password
                        </label>

                        <div className="relative">
                            <input
                                type={showPw ? "text" : "password"}
                                className={authInputCls}
                                value={pw}
                                onChange={(e) =>
                                    setPw(e.target.value)
                                }
                                required
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    setShowPw(!showPw)
                                }
                                className="absolute right-3 top-3"
                            >
                                {showPw ? (
                                    <EyeOff size={18} />
                                ) : (
                                    <Eye size={18} />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className={s.label}>
                            Confirm Password
                        </label>

                        <input
                            type={showPw ? "text" : "password"}
                            className={authInputCls}
                            value={pw2}
                            onChange={(e) =>
                                setPw2(e.target.value)
                            }
                            required
                        />
                    </div>

                    <AuthButton disabled={busy}>
                        {busy
                            ? "Updating..."
                            : "Reset Password"}
                    </AuthButton>
                </form>
            )}

            <p className={s.footerLink}>
                Remember it now?{" "}
                <Link to="/login" className={s.link}>
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    );
};

export default ForgotPasswordPage;