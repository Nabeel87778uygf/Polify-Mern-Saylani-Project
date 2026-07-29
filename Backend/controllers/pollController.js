import User from "../models/User.js";
import Poll from "../models/Poll.js";
import Comment from "../models/Comment.js";
import { uploadToCloudinary } from "../config/cloudinary.js";
import { shapePoll } from "../utils/pollShape.js";
import { withCounts } from "../utils/counts.js";

const POP = ["creator", "name username avatar"];

//bookmark
const bookmarkSet = async (userId) => {
    const me = await User.findById(userId).select("bookmarks");
    return new Set((me?.bookmarks || []).map(String));
}

//to create a poll
export const createPoll = async (req, res) => {

    try {
        const { question, type, category } = req.body;

        if (!question || !type)
            return res.status(400).json({ message: "Questions and type are required" });

        let options = [];
        if (type === "yesno") {
            options = [{ text: "Yes" }, { text: "No" }];
        } else if (type === "single") {
            const parsed = JSON.parse(req.body.options || "[]");
            options = parsed
                .filter((t) => t && t.trim())
                .map((t) => ({ text: t.trim() }));
            if (options.length < 2)
                return res.status(400).json({ message: "Add at least 2 options" });
        } else if (type === "image") {
            if (!req.files || req.files.length < 2)
                return res.status(400).json({ message: "Add at least 2 images" });
            const urls = await Promise.all(
                req.files.map((f) => uploadToCloudinary(f.buffer)),
            );
            options = urls.map((image) => ({ image, text: "" }));
        }

        const poll = await Poll.create({
            creator: req.userId,
            question,
            type,
            category,
            options
        });

        res.status(201).json(poll);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}


//shared list as a helper function for voted mine feed
const sendList = async (filter, req, res) => {
    const polls = await Poll.find(filter)
        .populate(...POP)
        .sort({ createdAt: -1 });

    const set = await bookmarkSet(req.userId);

    const shaped = polls.map((p) => shapePoll(p, req.userId, set));
    res.json(await withCounts(shaped));
}

//listPolls get listed polls
export const listPolls = async (req, res) => {
    try {
        const filter = {};

        if (req.query.type && req.query.type !== "all")
            filter.type = req.query.type;
        if (req.query.category) filter.category = req.query.category;
        if (req.query.feed === "following") {
            const me = await User.findById(req.userId).select("following");
            filter.creator = { $in: me?.following || [] };
        }

        await sendList(filter, req, res);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

//to get own polls
export const getMyPolls = async (req, res) => {
    try {
        await sendList({ creator: req.userId }, req, res);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}


//get votedpolls
export const getVotedPolls = async (req, res) => {
    try {
        await sendList({ "votes.user": req.userId }, req, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}


//the polls i bookmark on (get request)
export const getBookmarks = async (req, res) => {
    try {
        const me = await User.findById(req.userId).populate({
            path: "bookmarks",
            populate: { path: "creator", select: "name username avatar" }
        });
        const set = new Set((me?.bookmarks || []).map((p) => String(p._id)));
        const shaped = (me?.bookmarks || []).map((p) =>
            shapePoll(p, req.userId, set));
        res.json(await withCounts(shaped));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}



//search for polls
export const searchPolls = async (req, res) => {
    try {
        const { q, type, limit } = req.query;
        const filter = {};

        if (q && q.trim()) {
            filter.question = {
                $regex: q,
                $options: "i"
            }
        }

        if (type && type !== "all") {
            filter.type = type;
        }

        const polls = await Poll.find(filter)
            .populate(...POP)
            .sort({ createdAt: -1 })
            .limit(Number(limit) || 10);

        const set = await bookmarkSet(req.userId);
        const shaped = polls.map((p) => shapePoll(p, req.userId, set));
        res.json(await withCounts(shaped));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

//to get poll by id
export const getPollById = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id)
            .populate(...POP)
            .lean();

        if (!poll) {
            return res.status(404).json({ message: "Poll not found" });
        }

        const set = await bookmarkSet(req.userId);
        const shaped = shapePoll(poll, req.userId, set);
        res.json(await withCounts([shaped]));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}



//to get the count of polls per type
export const getTrending = async (req, res) => {
    try {
        const types = ["single", "image", "yesno", "rating", "open"];
        const counts = await Promise.all(
            types.map((t) => Poll.countDocuments({ type: t }))
        )
        res.json(types.map((t, i) => ({
            type: t,
            count: counts[i]
        })))
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

//to get single poll
export const getPoll = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id).populate(...POP);
        if (!poll) return res.status(404).json({ message: "Poll not found" });

        // Prevent view increment if request specifies ?noview=true OR if the user is the creator
        const creatorId = poll.creator?._id || poll.creater?._id || poll.creator || poll.creater;
        const isCreator = String(creatorId) === String(req.userId);
        const skipView = req.query.noview === "true";

        if (!isCreator && !skipView) {
            poll.views = (poll.views || 0) + 1; // count this view
            await poll.save();
        }

        const set = await bookmarkSet(req.userId);
        const [shaped] = await withCounts([shapePoll(poll, req.userId, set)]);
        res.json(shaped);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


//to get creater-only stats
export const getPollAnalytics = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id).populate(...POP);
        if (!poll) return res.status(404).json({ message: "Poll not found" });

        const creatorId = poll.creator?._id || poll.creator || poll.creater?._id || poll.creater;
        if (String(creatorId) !== String(req.userId))
            return res.status(403).json({ message: "Not your poll" });

        const shaped = shapePoll(poll, req.userId);
        const comments = await Comment.countDocuments({ poll: poll._id });
        res.json({
            poll: shaped, comments
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

//to toggle Pin / unpin on my polls
export const togglePin = async (req, res) => {
    try {
        const poll = await Poll.findById(req.params.id);
        if (!poll) return res.status(404).json({ message: "Poll not found" });

        const creatorId = poll.creator || poll.creater;
        if (String(creatorId) !== String(req.userId))
            return res.status(403).json({ message: "Not your poll" });

        poll.isPinned = !(poll.isPinned || false);
        await poll.save();

        res.json({ isPinned: poll.isPinned });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
}

