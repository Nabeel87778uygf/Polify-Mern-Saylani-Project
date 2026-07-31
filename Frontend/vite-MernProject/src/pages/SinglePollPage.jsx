import React, { useState, useEffect, useCallback } from "react";
import { singlePollPageStyles as s } from "../assets/dummyStyles.jsx";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

import PollCard from "../components/PollCard";
import { PollSkeleton } from "../components/UIElements";

import { ArrowLeft } from "lucide-react";

const SinglePollPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, refresh } = useAuth();

    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [missing, setMissing] = useState(false);

    // Load Poll
    const load = useCallback(async (skipView = false) => {
        try {
            setLoading(true);

            const { data } = await api.get(
                `/polls/${id}${skipView ? "?noview=true" : ""}`
            );

            setPoll(data);
            setMissing(false);
        } catch (err) {
            console.error(err);
            setMissing(true);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        load(false);
    }, [load]);

    // Vote
    const vote = async (_id, value) => {
        await api.post(`/polls/${id}/vote`, { value });
        await load(true);
        refresh?.();
    };

    // Remove Vote
    const unvote = async () => {
        await api.delete(`/polls/${id}/vote`);
        await load(true);
        refresh?.();
    };

    // Bookmark
    const bookmark = async () => {
        await api.post(`/polls/${id}/bookmark`);

        setPoll((p) => ({
            ...p,
            isBookmarked: !p.isBookmarked,
            saves: (p.saves || 0) + (p.isBookmarked ? -1 : 1),
        }));

        refresh?.();
    };

    // Edit Poll
    const edit = async (_id, payload) => {
        await api.patch(`/polls/${id}`, payload);
        await load(true);
    };

    // Close Poll
    const close = async () => {
        const { data } = await api.patch(`/polls/${id}/close`);

        setPoll((p) => ({
            ...p,
            closed: data.closed,
        }));
    };

    // Delete Poll
    const remove = async () => {
        await api.delete(`/polls/${id}`);
        navigate("/dashboard");
    };

    return (
        <div className={s.container}>
            <button
                onClick={() => navigate(-1)}
                className={s.backButton}
            >
                <ArrowLeft size={16} />
                Back
            </button>

            {loading ? (
                <PollSkeleton count={1} />
            ) : missing || !poll ? (
                <div className={s.errorContainer}>
                    This poll does not exist or has been deleted.
                </div>
            ) : (
                <PollCard
                    poll={poll}
                    vote={vote}
                    unvote={unvote}
                    bookmark={bookmark}
                    edit={edit}
                    close={close}
                    remove={remove}
                    owner={poll.creator?._id === user?._id}
                />
            )}
        </div>
    );
};

export default SinglePollPage;