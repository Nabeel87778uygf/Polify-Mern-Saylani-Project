import React from 'react'
import { dashboardStyles as s } from '../assets/dummyStyles'
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FILTERS, TYPE_META } from "../components/FilterBar";
import { SortBar } from "../components/SortBar";
import { Link } from "react-router-dom";
import { LikeButton, BookmarkButton, ShareButton } from "../components/PollCard";


function DashboardPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [feed, setFeed] = useState("all");
    const [type, setType] = useState("all");
    const [params] = useSearchParams();
    const q = params.get("q")?.trim().toLowerCase() || "";

    const qs = new URLSearchParams();
    if (type !== "all") qs.set("type", type);
    if (feed === "following") qs.set("feed", "following");
    const path = `/polls${qs.toString() ? `?${qs}` : ""}`;

    //to get polls


    return (
        <div className={s.container}>
            <div className={s.greetingRow}>
                <div>
                    <h1 className={s.greetingHeading}>
                        Hey, { }
                    </h1>
                </div>
            </div>

        </div>
    )
}

export default DashboardPage