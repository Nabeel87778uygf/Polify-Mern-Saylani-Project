import React from 'react';
import { authLayoutStyles as s } from "../assets/dummyStyles";
import { TrendingUp, Users, Zap } from "lucide-react";
import logo from "../assets/logo.png";

const STATS = [
    { Icon: Users, value: "50K+", label: "Community members" },
    { Icon: TrendingUp, value: "2M+", label: "Votes cast" },
    { Icon: Zap, value: "500K+", label: "Polls created" },
];

const AuthLayout = ({ title, subtitle, children }) => {
    return (
        <div className={s.container}>
            {/* Left Panel - Hidden on mobile, visible on desktop */}
            <div className={s.leftPanel}>
                <div
                    className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={s.gridPatternStyle}
                />
                <div className={s.glowTop} />
                <div className={s.glowBottom} />

                {/* logo */}
                <div className={s.logoContainer}>
                    <img src={logo} alt="Logo" className={s.logoImg} />
                    <span className={s.logoText}>Pollify</span>
                </div>

                {/* main copy */}
                <div className={s.mainCopyContainer}>
                    <div className={s.mainCopyInner}>
                        <span className={s.liveBadge}>
                            <span className={s.dot}></span>
                            Live community.
                        </span>
                        <h2 className={s.heading}>
                            Every opinion
                            <br />
                            <span className={s.emeraldText}>deserves to</span>
                            <br />
                            be counted.
                        </h2>
                    </div>
                    <p className={s.description}>
                        Create poll in seconds, collect votes instantly, and discover what your community truly thinks.
                    </p>

                    <div className={s.statsGrid}>
                        {STATS.map(({ Icon, value, label }) => (
                            <div key={label} className={s.statCard}>
                                <Icon size={15} className={s.emeraldText} />
                                <div className={s.statValue}>{value}</div>
                                <div className={s.statLabel}>{label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* footer */}
                <p className={s.footer}>
                    &copy; {new Date().getFullYear()} pollify * Made for the community
                </p>
            </div>

            {/* Right Panel - Login/Signup Form */}
            <div className={s.rightPanel}>
                <div className={s.formContainer}>
                    {/* Mobile Logo (Visible only on mobile) */}
                    <div className={s.mobileLogoContainer}>
                        <img src="/favicon.svg" alt="logo" className={s.mobileLogoImg} />
                        <span className={s.mobileLogoText}>Pollify</span>
                    </div>

                    <div className={s.headingWrapper}>
                        <h1 className={s.pageTitle}>{title}</h1>
                        {subtitle && <p className={s.subtitle}>{subtitle}</p>}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;