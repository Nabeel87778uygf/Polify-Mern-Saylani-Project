import express from "express";
import {
    getPublicProfile,
    getConnections,
    toggleFollow,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";


const userRouter = express.Router();
userRouter.use(protect);


//get followers and following
userRouter.get("/:username/connections", getConnections);

// to follow or unfollow user
userRouter.patch("/:username/follow", toggleFollow);

// get user profile , their polls and connection
userRouter.get("/:username", getPublicProfile);

export default userRouter;