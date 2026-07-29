import User from "../models/User.js";
import Poll from "../models/Poll.js";
import Notification from "../models/Notification.js";
import Comment from "../models/Comment.js";
import { notify } from "../controllers/notificationController.js";


export const votePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (poll.closed) {
            return res.status(400).json({
                message: "This poll is closed"
            });
        }
        const { value } = req.body;
        if (value === undefined || value === null || value === "") {
            return res.status(400).json({
                message: "Vote value is required"
            });
        }

        const hadVote = poll.votes.some((v) => String(v.user) === String(req.userId));
        poll.votes = poll.votes.filter((v) => String(v.user) !== String(req.userId));

        poll.votes.push({ user: req.userId, value });
        await poll.save();

        if (!hadVote) {
            await notify({
                user: poll.creator,
                actor: req.userId,
                poll: poll._id,
                type: "vote"
            });
        }
        res.json({ message: "Voted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed: " + error.message });
    }
}


//remove vote
export const removeVote = async (req, res) => {

    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: "poll not found" });

        if (poll.closed) return res.status(400).json({ message: "this poll is closed" });

        poll.votes = poll.votes.filter((v) => String(v.user) !== String(req.userId));
        await poll.save();

        res.json({ message: "vote removed successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "error removing vote" + error.message });
    }
}

//only creator can close the poll

export const ownerGuard = (poll, userId) => {
    if (!poll) return false;
    const creatorId = poll.creator?._id || poll.creator || poll.creater?._id || poll.creater;
    return String(creatorId) === String(userId);
};

//update any poll 
export const updatePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (!ownerGuard(poll, req.userId)) return res.status(403).json({ message: "Not your poll" });
        const { question, category } = req.body;
        if (question !== undefined && question.trim()) poll.question = question.trim();
        if (category !== undefined) poll.category = category;
        await poll.save();
        res.json({ message: "Poll updated" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//to add / remove from any bookmark
export const toggleBookmark = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const id = req.params.id;
        const has = user.bookmarks.some((b) => String(b) === String(id));
        user.bookmarks = has
            ? user.bookmarks.filter((b) => String(b) !== String(id))
            : [...user.bookmarks, id];
        await user.save();
        res.json({ bookmarked: !has });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

export const closePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (!ownerGuard(poll, req.userId)) return res.status(403).json({ message: "Not your poll" });
        poll.closed = !poll.closed;
        await poll.save();
        res.json({ closed: poll.closed });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


//to delete a poll and its comment
export const deletePoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });
        if (!ownerGuard(poll, req.userId)) return res.status(403).json({ message: "Not your poll" });


        await Comment.deleteMany({ poll: poll._id });
        await poll.deleteOne();
        res.json({ message: "Poll deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

