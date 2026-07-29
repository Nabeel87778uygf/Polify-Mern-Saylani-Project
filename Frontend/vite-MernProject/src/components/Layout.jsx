import React from "react";
import { NavLink, Outlet, useNavigate, useSearchParams } from "react-router-dom";
import {
    Search,
    LayoutGrid,
    PlusSquare,
    PenLine,
    CheckCircle2,
    Bookmark,
} from "lucide-react";

import { layoutStyles as s } from "../assets/dummyStlyes";
import logo from "../assets/logo.png";

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
                        <img src={logo} alt="Pollify Logo" className={s.logoImg} />
                        <span className={s.logoSpan}>Pollify</span>
                    </NavLink>

                    {/* Search */}
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

                    {/* Navigation */}
                    <nav className="flex items-center gap-4 ml-6">
                        {NAV.map(({ to, label, Icon }) => (
                            <NavLink
                                key={to}
                                to={to}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                            >
                                <Icon size={18} />
                                <span>{label}</span>
                            </NavLink>
                        ))}
                    </nav>
                </div>
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;