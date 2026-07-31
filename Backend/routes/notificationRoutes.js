import express from "express";
import { getNotifications, markRead } from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";



const notificationRouter = express.Router();
notificationRouter.use(protect);

notificationRouter.get("/", getNotifications);

notificationRouter.patch("/read", markRead);
notificationRouter.patch("/mark-read", markRead);

export default notificationRouter;

