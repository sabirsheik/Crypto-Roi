import User from "../../Models/authuser.js";
import Notification from "../../Models/admin/notification.js";

// ✅ Send notification to all users
export const contactAllUsers = async (req, res) => {
  try {
    const { title, message, priority } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // ✅ Find all active users
    const users = await User.find({}, "_id");

    // ✅ Create notifications for all users
    const notifications = users.map((user) => ({
      userId: user._id,
      title,
      message,
      priority,
    }));

    await Notification.insertMany(notifications);

    return res.status(200).json({
      success: true,
      message: "Message sent to all users successfully",
    });
  } catch (error) {
    console.error("Error sending notifications:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while sending notifications",
    });
  }
};

// ✅ Get notifications for a specific user (global + personal)
export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    // Global (userId:null) + personal (userId:userId)
    const raw = await Notification.find({
      $or: [{ userId }, { userId: null }],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    // Ensure every notification has isRead (for frontend)
    const notifications = raw.map((n) => {
      if (n.userId) return n; // personal
      return { ...n, isRead: false }; // global always unread for now
    });

    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    // Agar ye personal notification hai
    let notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true },
      { new: true }
    );

    // Agar global hai (userId: null), to just return it with isRead:true
    if (!notification) {
      const globalNotif = await Notification.findOne({ _id: notificationId, userId: null });
      if (!globalNotif) {
        return res.status(404).json({ success: false, message: "Notification not found" });
      }
      return res.status(200).json({ success: true, notification: { ...globalNotif.toObject(), isRead: true } });
    }

    return res.status(200).json({ success: true, notification });
  } catch (error) {
    console.error("Error marking notification:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



export const createNotification = async (req, res) => {
  try {
    const { title, message, priority } = req.body;

    const newNotif = await Notification.create({
      userId: null, // null = send to all
      title,
      message,
      priority: priority || "normal",
    });

    res.status(201).json({ success: true, notification: newNotif });
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


// ✅ Delete notification (Admin only)
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const deleted = await Notification.findByIdAndDelete(notificationId);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting notification",
    });
  }
};
