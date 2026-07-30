import React, { useState } from "react";
import { NavLink, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import {
    Search,
    LayoutGrid,
    PlusSquare,
    PenLine,
    CheckCircle2,
    Bookmark,
    X,
    Plus,
} from "lucide-react";

import { layoutStyles as s } from "../assets/dummyStlyes";
import logo from "../assets/logo.png";
import NotificationBell from "./NotificationBell";

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
                        {/* Mobile Search Button */}
                        <button
                            onClick={() => setMobileSearch((prev) => !prev)}
                            className={s.mobileSearchToggle}
                        >
                            {mobileSearch ? (
                                <X size={17} />
                            ) : (
                                <Search size={17} />
                            )}
                        </button>

                        {/* Create Poll Button */}
                        <NavLink
                            to="/create-poll"
                            className={s.createButton}
                        >
                            <Plus size={17} />
                            <span>Create</span>
                        </NavLink>

                        {/* Notification */}
                        <NotificationBell />

                        {/* avatar */}

                    </div>
                </div>

                {/* Mobile Search */}
                {mobileSearch && (
                    <div className="px-4 pb-4 md:hidden">
                        <input
                            type="text"
                            value={q}
                            onChange={handleSearch}
                            placeholder="Search Polls..."
                            className="w-full border rounded-lg px-3 py-2 outline-none"
                        />
                    </div>
                )}
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;