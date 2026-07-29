import Notification from "../models/Notification.js";

export const notify = async ({ user, actor, poll, type }) => {
    if (!user || String(user) === String(actor)) return;

    try {
        await Notification.create({ user, actor, poll, type });
    } catch (err) {
        console.log("Error creating notification : ", err);
    }

};

//unread count with the latest notification
export const getNotifications = async (req, res) => {
    try {
        const items = await Notification.find({ user: req.userId })
            .populate("actor", "username avatar")
            .populate("poll", "question ")
            .sort({ createdAt: -1 })
            .limit(20);

        const unread = await Notification.countDocuments({
            user: req.userId, read: false
        });

        res.json({ items, unread });

    } catch (err) {
        res.status(500).json({ message: "Error geting notification" + err.message });
    }
};


//to mark all notifcation as read 
export const markRead = async (req, res) => {
    try {
        await Notification.updateMany({ user: req.userId, read: false },
            {
                read: true

            });
        res.json({ ok: true });
    }
    catch (err) {
        res.status(500).json({ message: "Error marking notifcation" + err.message });
    }


}