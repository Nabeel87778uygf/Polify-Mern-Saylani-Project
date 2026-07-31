import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, UserPlus, UserCheck, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import api from "../utils/api";
import { Avatar, Button, PollSkeleton } from "../components/UIElements";
import PollCard from "../components/PollCard";
import { userProfileStyles as s, connectionsStyles as c } from "../assets/dummyStyles";

export default function ProfilePage() {
    const { username } = useParams();
    const { user: currentUser } = useAuth();
    const toast = useToast();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null); // { user, isFollowing, isMe, stats, polls }
    const [activeTab, setActiveTab] = useState("polls"); // "polls", "followers", "following"
    const [connections, setConnections] = useState({ followers: [], following: [] });
    const [loadingConnections, setLoadingConnections] = useState(false);
    const [followBusy, setFollowBusy] = useState(false);

    // Fetch public profile
    useEffect(() => {
        setLoading(true);
        setActiveTab("polls");
        api.get(`/users/${username}`)
            .then(({ data }) => {
                setData(data);
            })
            .catch((err) => {
                toast(err.response?.data?.message || "Failed to load profile", "error");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [username, toast]);

    // Fetch connections when activeTab changes to followers or following
    useEffect(() => {
        if (activeTab === "followers" || activeTab === "following") {
            setLoadingConnections(true);
            api.get(`/users/${username}/connections`)
                .then(({ data }) => {
                    setConnections(data);
                })
                .catch((err) => {
                    toast(err.response?.data?.message || "Failed to load connections", "error");
                })
                .finally(() => {
                    setLoadingConnections(false);
                });
        }
    }, [username, activeTab, toast]);

    if (loading) {
        return (
            <div className="py-6">
                <PollSkeleton />
            </div>
        );
    }

    if (!data) {
        return (
            <div className={s.errorContainer}>
                User not found or failed to load profile.
            </div>
        );
    }

    const { user, isFollowing, isMe, stats, polls } = data;

    // Follow/Unfollow handler
    const handleFollow = async () => {
        if (followBusy) return;
        setFollowBusy(true);
        try {
            const { data: res } = await api.patch(`/users/${username}/follow`);
            setData((prev) => ({
                ...prev,
                isFollowing: res.following,
                stats: {
                    ...prev.stats,
                    followers: res.followers,
                },
            }));
            toast(res.following ? `Followed @${username}` : `Unfollowed @${username}`);
        } catch (err) {
            toast(err.response?.data?.message || "Follow request failed", "error");
        } finally {
            setFollowBusy(false);
        }
    };

    // Vote handler inside profile page
    const handleVote = async (pollId, optionValue) => {
        try {
            await api.post(`/polls/${pollId}/vote`, { value: optionValue });
            const { data: updatedPoll } = await api.get(`/polls/${pollId}?noview=true`);
            setData((prev) => ({
                ...prev,
                polls: prev.polls.map((p) => (p._id === pollId ? updatedPoll : p)),
            }));
            toast("Vote recorded");
        } catch (err) {
            toast(err.response?.data?.message || "Vote failed", "error");
        }
    };

    // Bookmark handler inside profile page
    const handleBookmark = async (pollId) => {
        try {
            await api.post(`/polls/${pollId}/bookmark`);
            setData((prev) => ({
                ...prev,
                polls: prev.polls.map((p) =>
                    p._id === pollId
                        ? {
                            ...p,
                            isBookmarked: !p.isBookmarked,
                            saves: (p.saves || 0) + (p.isBookmarked ? -1 : 1),
                        }
                        : p
                ),
            }));
            toast("Bookmark updated");
        } catch (err) {
            toast(err.response?.data?.message || "Bookmark failed", "error");
        }
    };

    const renderConnectionsList = (users) => {
        if (users.length === 0) {
            return <p className={c.emptyText}>No users found.</p>;
        }
        return (
            <ul className={c.userList}>
                {users.map((u) => (
                    <li key={u._id}>
                        <Link to={`/user/${u.username}`} className={c.userLink}>
                            <Avatar user={u} className={c.userAvatar} />
                            <div className={c.userInfo}>
                                <p className={c.userName}>{u.name}</p>
                                <p className={c.userUsername}>@{u.username}</p>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div>
            {/* Header / Back Link */}
            <Link to="/dashboard" className={s.backButton}>
                <ArrowLeft size={14} /> Back to Dashboard
            </Link>

            {/* Profile Card */}
            <div className={s.profileCard}>
                <div className={s.bannerContainer}>
                    <div className={s.bannerGlow}></div>
                </div>

                <div className={s.profileBody}>
                    <div className={s.avatarRow}>
                        <Avatar user={user} className={s.avatarClass} />

                        {!isMe && (
                            <Button
                                onClick={handleFollow}
                                variant={isFollowing ? "ghost" : "primary"}
                                className={s.followButton}
                                disabled={followBusy}
                            >
                                {isFollowing ? (
                                    <span className="flex items-center">
                                        <UserCheck size={12} className="mr-1 shrink-0" />
                                        Following
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <UserPlus size={12} className="mr-1 shrink-0" />
                                        Follow
                                    </span>
                                )}
                            </Button>
                        )}
                    </div>

                    <div className={s.userInfo}>
                        <h2 className={s.userName}>{user.name}</h2>
                        <p className={s.userUsername}>@{user.username}</p>
                        {user.bio && <p className={s.userBio}>{user.bio}</p>}
                    </div>

                    {/* Stats Row */}
                    <div className={s.statsRow}>
                        <button
                            onClick={() => setActiveTab("polls")}
                            className={`${s.statLabel} ${activeTab === "polls" ? s.statLabelHighlight : ""}`}
                        >
                            <span className={s.statNumber}>{stats.created}</span> Polls
                        </button>

                        <div className={s.statLabel}>
                            <span className={s.statNumber}>{stats.voted}</span> Voted
                        </div>

                        <button
                            onClick={() => setActiveTab("followers")}
                            className={`${s.statLabel} ${s.statClickable} ${activeTab === "followers" ? s.statLabelHighlight : ""}`}
                        >
                            <span className={s.statNumber}>{stats.followers}</span> Followers
                        </button>

                        <button
                            onClick={() => setActiveTab("following")}
                            className={`${s.statLabel} ${s.statClickable} ${activeTab === "following" ? s.statLabelHighlight : ""}`}
                        >
                            <span className={s.statNumber}>{stats.following}</span> Following
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Tabs area */}
            {activeTab === "polls" ? (
                <div>
                    <h3 className={s.pollsHeading}>Polls</h3>
                    {polls.length === 0 ? (
                        <div className={s.emptyPolls}>
                            <Sparkles size={16} className="inline-block mr-1.5 opacity-50" />
                            No polls posted yet.
                        </div>
                    ) : (
                        polls.map((p) => (
                            <PollCard
                                key={p._id}
                                poll={p}
                                vote={handleVote}
                                bookmark={handleBookmark}
                                owner={isMe}
                            />
                        ))
                    )}
                </div>
            ) : (
                <div className={s.connectionsWrapper}>
                    <div className={c.tabContainer}>
                        <button
                            onClick={() => setActiveTab("followers")}
                            className={`${c.tabButtonBase} ${activeTab === "followers" ? c.tabButtonActive : c.tabButtonInactive}`}
                        >
                            Followers
                        </button>
                        <button
                            onClick={() => setActiveTab("following")}
                            className={`${c.tabButtonBase} ${activeTab === "following" ? c.tabButtonActive : c.tabButtonInactive}`}
                        >
                            Following
                        </button>
                    </div>

                    <div className="mt-4">
                        {loadingConnections ? (
                            <div className="py-4 text-center text-xs text-zinc-600">Loading connection data...</div>
                        ) : (
                            renderConnectionsList(activeTab === "followers" ? connections.followers : connections.following)
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
