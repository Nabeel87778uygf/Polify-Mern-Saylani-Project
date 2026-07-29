import Comment from "../models/Comment.js";
import Poll from "../models/Poll.js";
import { notify } from "./notificationController.js";

//create comment
export const getComments = async (req, res) => {
    try {
        const comments = await Comment.find({ poll: req.params.pollId })
            .populate("user", "_id name username avatar")
            .sort({ createdAt: 1 });
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

//to add a comment to a poll
export const addComment = async (req, res) => {
    try {
        const text = (req.body.text || "").trim();
        if (!text) return res.status(400).json({ message: "Comment cannit be empty" });

        const comment = await Comment.create({

            poll: req.params.pollId,
            user: req.userId,
            parent: req.body.parent || null,
            text

        });

        const populated = await comment.populate("user", "name username avatar");
        const poll = await Poll.findById(req.params.pollId).select("creator");

        if (poll) await notify({
            user: poll.creator,
            actor: req.userId,
            poll: poll._id,
            type: "comment",
        });
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}


//author want to remove the comment
export const deleteComment = async (req, res) => {

    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) res.status(404).json({ message: "Comment not found" });

        if (String(comment.user) !== String(req.userId))
            return res.status(403).json({ message: "Not your comment" });

        await Comment.deleteMany({ $or: [{ _id: comment._id }, { parent: comment._id }] });

        res.status(200).json({ message: "Comment deleted successfully" });


    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}
