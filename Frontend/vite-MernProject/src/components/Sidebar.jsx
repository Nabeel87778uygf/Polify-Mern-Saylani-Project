import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    TrendingUp,
    CheckCircle,
    BarChart3,
    MessageSquare,
} from "lucide-react";

import { sidebarStyles as s } from "../assets/dummyStyles";
import { useAuth } from "../context/AuthContext";
import { Avatar } from "./UIElements";
import api from "../utils/api";


const COLORS = [
    "bg-emerald-500",
    "bg-sky-500",
    "bg-violet-500",
    "bg-amber-500",
    "bg-rose-500",
];

const TYPE_META = {
    single: {
        label: "Single Choice",
        Icon: CheckCircle,
    },
    multiple: {
        label: "Multiple Choice",
        Icon: BarChart3,
    },
    text: {
        label: "Text Poll",
        Icon: MessageSquare,
    },
};

function Stat({ n, label }) {
    return (
        <div className={s.statBox}>
            <p className={s.statNumber}>{n ?? 0}</p>
            <p className={s.statLabel}>{label}</p>
        </div>
    );
}

function ProfileCard() {
    const { user, state } = useAuth();
    const { stats } = state || {};

    if (!user) return null;

    return (
        <div className={s.profileCard}>
            <div className={s.glowBlob}></div>

            <div className={s.profileInner}>
                <div className={s.avatarWrapper}>
                    <div className={s.avatarGlow}></div>

                    <Avatar user={user} className={s.avatar} />
                </div>

                <Link
                    to={`/user/${user.username}`}
                    className={s.userNameLink}
                >
                    {user.name}
                </Link>

                <p className={s.usernameText}>
                    @{user.username}
                </p>
            </div>

            <div className={s.statsContainer}>
                <Stat n={stats?.created} label="Created" />
                <Stat n={stats?.voted} label="Voted" />
                <Stat n={stats?.bookmarked} label="Saved" />
            </div>

            <Link
                to={`/user/${user.username}`}
                className={s.viewProfileLink}
            >
                View Profile
            </Link>
        </div>
    );
}

function Trending() {
    const [items, setItems] = useState([]);

    useEffect(() => {
        api
            .get("/polls/trending")
            .then(({ data }) => {
                setItems(Array.isArray(data) ? data : []);
            })
            .catch((err) => {
                console.log(err);
                setItems([]);
            });
    }, []);

    const max = Math.max(
        1,
        ...items.map((i) => i.count || 0)
    );

    return (
        <div className={s.trendingCard}>
            <h3 className={s.trendingHeading}>
                <TrendingUp
                    size={12}
                    className={s.trendingIcon}
                />
                {" "}Poll Types
            </h3>

            {items.length === 0 ? (
                <p className={s.emptyText}>
                    No trending data.
                </p>
            ) : (
                <ul className={s.trendingList}>
                    {items.map((it, idx) => {
                        const meta = TYPE_META[it.type];

                        if (!meta) return null;

                        const Icon = meta.Icon;

                        const pct = Math.round(
                            ((it.count || 0) / max) * 100
                        );

                        return (
                            <li key={it.type}>
                                <div className={s.trendingItemRow}>
                                    <span className={s.trendingItemLabel}>
                                        <Icon
                                            size={12}
                                            className={s.trendingItemIcon}
                                        />
                                        {" "}
                                        {meta.label}
                                    </span>

                                    <span className={s.trendingItemCount}>
                                        {it.count}
                                    </span>
                                </div>

                                <div className={s.trendingBarTrack}>
                                    <div
                                        className={`${s.trendingBarFillBase} ${COLORS[idx % COLORS.length]
                                            }`}
                                        style={{
                                            width: `${pct}%`,
                                        }}
                                    />
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default function Sidebar() {
    return (
        <>
            <ProfileCard />
            <Trending />
        </>
    );
}