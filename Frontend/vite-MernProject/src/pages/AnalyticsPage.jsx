import React, { useEffect, useState } from 'react';
import { analyticsStyles as s } from "../assets/dummyStyles.jsx";
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, BarChart3, MessageCircle, Activity } from "lucide-react";
import { PollSkeleton } from "../components/UIElements.jsx";
import PollResults from "../components/PollResults.jsx";
import api from "../utils/api.js";

function StatCard({ Icon, label, value, color }) {
    return (
        <div className={s.statCard}>
            <span className={`${s.statIcon} ${color}`}>
                <Icon size={15} />
            </span>
            <p className={s.statValue}>{value}</p>
            <p className={s.statLabel}>{label}</p>
        </div>
    );
}

const AnalyticsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    //to get the analytics data 
    useEffect(() => {
        api
            .get(`/polls/${id}/analytics`)
            .then(({ data }) => setData(data))
            .catch((e) =>
                setError(e.response?.data?.message || "Could not load analytics"),
            )
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <PollSkeleton />;
    if (error || !data)
        return (
            <div className={s.errorContainer}>
                {error || "Not found."}
            </div>
        );

    const { poll, comments } = data;
    const engagement = poll.views
        ? Math.round((poll.totalVotes / poll.views) * 100)
        : 0;

    return (
        <div className={s.container}>
            <button onClick={() => navigate(-1)} className={s.backButton}>
                <ArrowLeft size={14} /> Back
            </button>

            <div>
                <h1 className={s.heading}>Poll Analytics</h1>
                <p className={s.subtitle}>{poll.question}</p>
            </div>

            <div className={s.statsGrid}>
                <StatCard Icon={Eye} label="views" value={poll.views}
                    color="bg-sky-500/10 text-sky-500"
                />

                <StatCard Icon={BarChart3} label="Votes" value={`${poll.totalVotes}`}
                    color="bg-emerald-500/10 text-emerald-500"
                />

                <StatCard Icon={MessageCircle} label="Comments" value={comments}
                    color="bg-amber-500/10 text-amber-500"
                />

                <StatCard Icon={Activity} label="Engagement" value={`${engagement}%`}
                    color="bg-violet-500/10 text-violet-500"
                />

                <div className={s.resultsContainer}>
                    <p className={s.resultsHeading}>Results breakdown</p>
                    <PollResults poll={poll} />
                </div>
            </div>
        </div>
    );

}

export default AnalyticsPage;