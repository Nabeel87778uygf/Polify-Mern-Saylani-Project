import React, { useState } from 'react'
import { signupStyles as s, loginStyles as loginS } from "../assets/dummyStyles";
import AuthLayout from "../components/AuthLayout";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from 'react-router-dom';
import { User, Camera, Mail, Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';

const RegisterPage = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: "",
        email: "",
        username: "",
        password: "",
    });

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [show, setShow] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const change = (e) =>
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

    //for image handling
    const pickImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    const getStrength = (password) => {
        if (!password) return 0;
        let score = 0;
        if (password.length >= 6) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        return score; // 0 to 4
    };

    const strength = getStrength(form.password);

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setBusy(true);

        const formDataObj = new FormData();
        formDataObj.append("name", form.name);
        formDataObj.append("email", form.email);
        formDataObj.append("username", form.username.toLowerCase().trim());
        formDataObj.append("password", form.password);
        if (image) {
            formDataObj.append("image", image);
        }

        try {
            await register(formDataObj);
            navigate("/verify-otp", { state: { email: form.email } });
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || "Registration failed. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthLayout
            title="Create Account"
            subtitle="Join thousands of people shaping opinions."
        >
            {error && (
                <div className={s.errorBox}>
                    <AlertCircle size={14} className={s.errorIcon} />
                    <p className={s.errorText}>{error}</p>
                </div>
            )}

            <form onSubmit={submit} className={s.form}>
                {/* Avatar Picker */}
                <div className={s.avatarContainer}>
                    <label className={s.avatarLabel}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={pickImage}
                            className="hidden"
                        />
                        <div className={s.avatarCircle}>
                            {preview ? (
                                <img src={preview} alt="Avatar Preview" className={s.avatarImage} />
                            ) : (
                                <User className={s.avatarPlaceholder} size={24} />
                            )}
                            <div className={s.avatarCamera}>
                                <Camera className={s.avatarCameraIcon} size={10} />
                            </div>
                        </div>
                    </label>
                    <div className={s.avatarInfo}>
                        <div className={s.avatarInfoTitle}>Profile photo</div>
                        <div className={s.avatarInfoSub}>Optional • PNG or JPG</div>
                    </div>
                </div>

                {/* Full Name Field */}
                <div className={s.field}>
                    <label className={s.label}>Full Name</label>
                    <div className={s.inputWrapper}>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="John Doe"
                            value={form.name}
                            onChange={change}
                            className={`${loginS.input} pl-4`}
                        />
                    </div>
                </div>

                {/* Username Field */}
                <div className={s.field}>
                    <label className={s.label}>Username</label>
                    <div className={s.inputWrapper}>
                        <input
                            type="text"
                            name="username"
                            required
                            placeholder="username"
                            value={form.username}
                            onChange={change}
                            className={`${loginS.input} ${s.inputWithPrefix}`}
                        />
                        <span className={s.prefix}>@</span>
                    </div>
                </div>

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
                            className={`${loginS.input} ${s.inputWithSuffix}`}
                        />
                        <Mail size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                    </div>
                </div>

                {/* Password Field */}
                <div className={s.field}>
                    <label className={s.label}>Password</label>
                    <div className={s.inputWrapper}>
                        <input
                            type={show ? "text" : "password"}
                            name="password"
                            required
                            placeholder="Create password"
                            value={form.password}
                            onChange={change}
                            className={`${loginS.input} ${s.inputWithSuffix}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShow(!show)}
                            className={s.toggleButton}
                        >
                            {show ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {/* Password Strength Indicator */}
                    <div className={s.strengthContainer}>
                        {[1, 2, 3, 4].map((index) => {
                            let barClass = s.strengthInactive;
                            if (strength >= index) {
                                if (strength === 1) barClass = s.strengthWeak;
                                else if (strength === 2) barClass = s.strengthMedium;
                                else if (strength === 3) barClass = s.strengthStrong;
                                else if (strength === 4) barClass = s.strengthVeryStrong;
                            }
                            return (
                                <div
                                    key={index}
                                    className={`${s.strengthBarBase} ${barClass}`}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={busy}
                    className={loginS.submitButton}
                >
                    {busy ? (
                        <>
                            <Loader size={16} className="animate-spin" />
                            <span>Creating account...</span>
                        </>
                    ) : (
                        <span>Create Account</span>
                    )}
                </button>
            </form>

            <p className={s.terms}>
                By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>

            <p className={s.footerText}>
                Already have an account?{" "}
                <Link to="/login" className={s.footerLink}>
                    Sign In
                </Link>
            </p>
        </AuthLayout>
    );
};

export default RegisterPage;
