import { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import { useToast } from "../components/Toast";

export default function usePolls(path) {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);

    const toast = useToast();

    // Agar AuthContext me refresh function hai to wahan se lo.
    // Filhal empty function rakha hai.
    const refresh = () => { };

    // Load polls
    const load = useCallback(async () => {
        setLoading(true);

        try {
            const { data } = await api.get(path);
            setPolls(data);
        } catch (err) {
            toast(
                err.response?.data?.message || "Failed to load polls",
                "error"
            );
        } finally {
            setLoading(false);
        }
    }, [path, toast]);

    useEffect(() => {
        load();
    }, [load]);

    // Replace updated poll
    const replace = (poll) => {
        setPolls((arr) =>
            arr.map((x) => (x._id === poll._id ? poll : x))
        );
    };

    // Vote
    const vote = async (id, value) => {
        try {
            await api.post(`/polls/${id}/vote`, { value });

            const { data } = await api.get(`/polls/${id}?noview=true`);

            replace(data);
            toast("Vote recorded");
            refresh();
        } catch (err) {
            toast(
                err.response?.data?.message ||
                "Couldn't record vote. Is the server running?",
                "error"
            );
        }
    };

    // Bookmark
    const bookmark = async (id) => {
        try {
            await api.post(`/polls/${id}/bookmark`);

            setPolls((arr) =>
                arr.map((x) =>
                    x._id === id
                        ? {
                            ...x,
                            isBookmarked: !x.isBookmarked,
                            saves: (x.saves || 0) + (x.isBookmarked ? -1 : 1),
                        }
                        : x
                )
            );

            toast("Bookmark updated");
        } catch (err) {
            toast(
                err.response?.data?.message || "Bookmark failed",
                "error"
            );
        }
    };

    // Edit poll
    const edit = async (id, payload) => {
        try {
            await api.patch(`/polls/${id}`, payload);

            const { data } = await api.get(`/polls/${id}?noview=true`);

            replace(data);

            toast("Poll updated");
        } catch (err) {
            toast(
                err.response?.data?.message || "Update failed",
                "error"
            );
        }
    };

    // Close / Re-open poll
    const close = async (id) => {
        try {
            const { data } = await api.patch(`/polls/${id}/close`);

            setPolls((arr) =>
                arr.map((x) => (x._id === id ? data : x))
            );

            toast("Poll status updated");
        } catch (err) {
            toast(
                err.response?.data?.message || "Operation failed",
                "error"
            );
        }
    };

    // Delete poll
    const remove = async (id) => {
        try {
            await api.delete(`/polls/${id}`);

            setPolls((arr) =>
                arr.filter((x) => x._id !== id)
            );

            toast("Poll deleted");
            refresh();
        } catch (err) {
            toast(
                err.response?.data?.message || "Delete failed",
                "error"
            );
        }
    };

    return {
        polls,
        loading,
        load,
        vote,
        bookmark,
        edit,
        close,
        remove,
    };
}