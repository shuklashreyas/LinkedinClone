import Notification from "../models/notification.model.js";

export const getUserNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({recipient: req.user._id}).sort({createdAt: -1}).
        populate("relatedUser", "name username profilePicture").populate("relatedPost", "content image");

        res.status(200).json(notifications);
    }
    catch (error) {
        console.error("Error fetching notifications", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

export const markNotificationsAsRead = async (req, res) => {
    const notificationId = req.params.id;
    try {
        const notification = await Notification.findByIdAndUpdate({_id: notificationId, recipient: req.user._id}, {read: true}, {new: true});
        res.json(notification);
    }
    catch (error) {
        console.error("Error marking notifications as read", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}

export const deleteNotification = async (req, res) => {
    const notificationId = req.params.id;
    try {
        await Notification.findOneAndDelete({
            _id: notificationId,
            recipient: req.user._id,
        });

        res.json({message: "Notification deleted"});
    }
    catch (error) {
        console.error("Error deleting notification", error.message);
        res.status(500).json({message: "Internal server error"});
    }
}