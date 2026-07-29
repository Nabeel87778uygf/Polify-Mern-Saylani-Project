import express from "express"
import { protect } from "../middleware/auth.js";
import { createPoll, getMyPolls, listPolls, getBookmarks, getPollAnalytics, getTrending, getVotedPolls } from "../controllers/pollController.js";
import { votePoll, removeVote, closePoll, toggleBookmark, deletePoll, updatePoll } from "../controllers/voteController.js";
import { upload } from "../config/cloudinary.js";

const pollRouter = express.Router();
pollRouter.use(protect);


pollRouter.get("/", listPolls);
pollRouter.post("/", upload.array("images", 4), createPoll);
pollRouter.get("/mine", getMyPolls);

pollRouter.get("/voted", getVotedPolls);
pollRouter.post('/bookmarks', getBookmarks);
pollRouter.get('/trending', getTrending);

//vote 
pollRouter.post('/:id/vote', votePoll);
pollRouter.delete('/:id/vote', removeVote);
pollRouter.patch('/:id/close', closePoll);

pollRouter.patch("/:id", updatePoll);
pollRouter.delete("/:id", deletePoll);

pollRouter.patch("/:id/bookmark", toggleBookmark);

export default pollRouter;