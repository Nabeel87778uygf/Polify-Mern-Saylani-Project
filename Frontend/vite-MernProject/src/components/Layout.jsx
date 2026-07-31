import React, { useState, useRef } from "react";
import { NavLink, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import {
    Search,
    X,
    Plus,
    LayoutGrid,
    PlusSquare,
    PenLine,
    CheckCircle2,
    Bookmark,
    Settings,
    LogOut,
} from "lucide-react";

import { layoutStyles as s } from "../assets/dummyStyles";
import logo from "../assets/logo.png";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../context/AuthContext";
import { Avatar, Button } from "./UIElements";
import Sidebar from "./Sidebar";

const NAV = [
    { to: "/dashboard", label: "Dashboard", Icon: LayoutGrid },
    { to: "/create-poll", label: "Create", Icon: PlusSquare },
    { to: "/my-polls", label: "My Polls", Icon: PenLine },
    { to: "/voted-polls", label: "Voted", Icon: CheckCircle2 },
    { to: "/bookmarked-polls", label: "Saved", Icon: Bookmark },
];


function Layout() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Get logged-in user from AuthContext
    const { user, logout } = useAuth();

    const avatarRef = useRef(null);

    const [mobileSearch, setMobileSearch] = useState(false);

    const q = searchParams.get("q") || "";

    const handleSearch = (e) => {
        navigate(`/dashboard?q=${encodeURIComponent(e.target.value)}`, {
            replace: true,
        });
    };

    return (
        <div className={s.container}>
            <header className={s.header}>
                <div className={s.headerInner}>

                    {/* Logo */}
                    <NavLink to="/dashboard" className={s.logoLink}>
                        <img
                            src={logo}
                            alt="Pollify Logo"
                            className={s.logoImg}
                        />
                        <span className={s.logoSpan}>Pollify</span>
                    </NavLink>

                    {/* Desktop Search */}
                    <div className={s.searchDesktop}>
                        <Search size={16} className={s.searchIcon} />

                        <input
                            type="text"
                            value={q}
                            onChange={handleSearch}
                            placeholder="Search Polls..."
                            className={s.searchInput}
                        />
                    </div>

                    {/* Right Section */}
                    <div className={s.rightCluster}>

                        {/* Mobile Search */}
                        <button
                            onClick={() => setMobileSearch((prev) => !prev)}
                            className={s.mobileSearchToggle}
                        >
                            {mobileSearch ? <X size={17} /> : <Search size={17} />}
                        </button>

                        {/* Create Poll */}
                        <NavLink
                            to="/create-poll"
                            className={s.createButton}
                        >
                            <Plus size={17} />
                            <span>Create</span>
                        </NavLink>

                        {/* Notifications */}
                        <NotificationBell />

                        {/* Avatar */}
                        <div ref={avatarRef} className={s.avatarWrapper}>
                            <Avatar
                                user={user || {}}
                                className={s.avatarClass}
                            />
                        </div>

                    </div>
                </div>

                {/* mobile expanded search */}
                {mobileSearch && (
                    <div className={s.mobileSearchContainer}>
                        <div className={s.mobileSearchInner}>
                            <Search size={14} className={s.searchIcon} />

                            <input autoFocus value={q}
                                onChange={(e) =>
                                    navigate(
                                        `/dashboard?q=${encodeURIComponent(e.target.value)}`,
                                        { replace: true }
                                    )
                                }
                                placeholder="Search polls"
                                className={s.mobileSearchInput}
                            />
                        </div>
                    </div>
                )}

            </header>

            {/* body */}
            <div className={s.bodyContainer}>
                <aside className={s.leftSidebar}>
                    <p className={s.menuLabel}>Menu</p>

                    <nav className={s.navContainer}>
                        {NAV.map(({ to, label, Icon }) => (
                            <NavLink key={to} to={to} className={({ isActive }) =>
                                `${s.sideLinkBase} ${isActive ? s.sideLinkActive : s.sideLinkInactive}`
                            }
                            >
                                <Icon size={16} className=" shrink-0" />
                                {label}

                            </NavLink>
                        ))}

                    </nav>

                    <div className={s.sidebarBottom}>
                        <NavLink to="/settings" className={({ isActive }) =>
                            `${s.sideLinkBase} ${isActive ? s.sideLinkActive : s.sideLinkInactive}`
                        }
                        >
                            <Settings size={16} className="shrink-0" /> Settings
                        </NavLink>
                        <Button
                            onClick={() => {
                                logout();
                                navigate("/login");
                            }}
                            className={s.logoutButton}
                        >
                            <LogOut size={16} className="shrink-0" /> Logout
                        </Button>
                    </div>

                </aside>

                {/* MAIN */}
                <main className={s.mainContent}>
                    <Outlet />
                </main>

                {/* right Rail */}
                <aside className={s.rightRail}>
                    <Sidebar />
                </aside>

            </div >
        </div >
    );
}

export default Layout;