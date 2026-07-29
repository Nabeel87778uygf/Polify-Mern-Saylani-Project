import Comment from "../models/Comment.js";
import User from "../models/User.js";

//to get the count for total users
async function countsFor(pollIds) {
    if (!pollIds.length) return { commentMap: {}, saveMap: {} };


    const [comments, saves] = await Promise.all([
        Comment.aggregate([
            { $match: { poll: { $in: pollIds } } },
            { $group: { _id: "$poll", n: { $sum: 1 } } },
        ]),
        User.aggregate([
            { $match: { bookmarks: { $in: pollIds } } },
            { $unwind: "$bookmarks" },
            { $match: { bookmarks: { $in: pollIds } } },
            { $group: { _id: "$bookmarks", n: { $sum: 1 } } },
        ]),
    ]);
    const commentMap = {};
    const saveMap = {};
    comments.forEach((c) => (commentMap[String(c._id)] = c.n));
    saves.forEach((s) => (saveMap[String(s._id)] = s.n));
    return { commentMap, saveMap };

}

export async function withCounts(shapedPolls) {
    const { commentMap, saveMap } = await countsFor(
        shapedPolls.map(p => p._id)
    )

    return shapedPolls.map((poll) => ({
        ...poll,
        comments: commentMap[String(poll._id)] || 0,
        saves: saveMap[String(poll._id)] || 0,
    }));


}


