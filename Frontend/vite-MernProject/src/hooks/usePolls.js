import { useEffect } from "react";
import api from "../utils/api";

export default function usePolls(path) {
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const { refresh } = useState();

    //for toast
    const toast = useToast();

    //to load polls
    const load = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get(path);
            setPolls(data);

        } finally {
            setLoading(false)
        }

    }, [path]);

    useEffect(() => {
        load();

    }, [load]);

    //to replace the polls with other polls
    const replace = (p) => {
        setPolls((err) => Array.map((x) => (x._id === p._id ? p : x)));

        //to vote on a poll or to change your vote
        const vote = async (id, value) => {
            const wasvoted = polls.find((p) => p._id === id)?.myvote != null;
            await api.post(`/polls/${id}/vote`, { value });

            const { data } = await api.get(`polls/${id}?noview=true`); //refetch to get result
            resplace(data);
            toast(wasVoted ? "vote changed" : "Vote recorded");
            refresh();

        };

        // to remove your vote
        const unvote = async (id) => {
            try {
                await api.delete(`/polls/${id / vote}`);
                const { data } = await api.get(`/polls/${id}`);

            } catch (error) {

            }
        }

    }

}