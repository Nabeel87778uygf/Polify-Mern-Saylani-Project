import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle, Mail, Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { loginStyles as s } from "../assets/dummyStlyes";
import AuthLayout from '../components/AuthLayout';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const flash = useLocation().state;
    const notice = flash?.verified
        ? "Email verified! you can now sign in."
        : flash?.reset
            ? "Password updated! Sign in with your new Password."
            : "";

    const [form, setForm] = useState({ email: "", password: "" });
    const [show, setShow] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    //to submit the credtials and get logged in
    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);

        try {
            await login(form);
            navigate("/dashboard");
        } catch (err) {
            const data = err.response?.data;

            if (data?.needsVerification || data?.needVerification)
                return navigate("/verify-otp", { state: { email: form.email } });

            setError(data?.message || "Login failed. Check your credentials");
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthLayout 
            title="welcome Back"
            subtitle="Sign in to your Pollify account"
        >
            {notice && (
                <div className={s.notice}>
                    <CheckCircle size={14} className={s.noticeIcon} />
                    <p className={s.noticeText}>{notice}</p>
                </div>
            )}

            {error && (
                <div className={s.error}>
                    <AlertCircle size={14} className={s.errorIcon} />
                    <p className={s.errorText}>{error}</p>
                </div>
            )}

            <form onSubmit={submit} className={s.form}>
                {/* Email Field */}
                <div className={s.field}>
                    <label className={s.label}>Email Address</label>
                    <div className={s.inputWrapper}>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="you@example.com"
                            value={form.email}
                            onChange={change}
                            className={`${s.input} ${s.inputWithIcon}`}
                        />
                        <Mail size={16} className={s.icon} />
                    </div>
                </div>

                {/* Password Field */}
                <div className={s.field}>
                    <div className={s.passwordRow}>
                        <label className={s.label}>Password</label>
                        <Link to="/forgot-password" className={s.forgotLink}>
                            Forgot Password?
                        </Link>
                    </div>
                    <div className={s.inputWrapper}>
                        <input
                            type={show ? "text" : "password"}
                            name="password"
                            required
                            placeholder="Enter password"
                            value={form.password}
                            onChange={change}
                            className={`${s.input} ${s.inputWithIcon}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShow(!show)}
                            className={s.toggleButton}
                        >
                            {show ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={busy}
                    className={s.submitButton}
                >
                    {busy ? (
                        <>
                            <Loader size={16} className="animate-spin" />
                            <span>Signing in...</span>
                        </>
                    ) : (
                        <span>Sign In</span>
                    )}
                </button>
            </form>

            <div className={s.divider}>
                <div className={s.dividerLine} />
                <span className={s.dividerText}>New to Pollify?</span>
                <div className={s.dividerLine} />
            </div>

            <Link to="/register" className={s.signupLink}>
                Create an Account
            </Link>
        </AuthLayout>
    );
};

export default LoginPage;