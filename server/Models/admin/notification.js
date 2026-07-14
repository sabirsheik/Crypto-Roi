// Models/admin/notification.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // null = global
    title: { type: String, required: true },
    message: { type: String, required: true },
   priority: ["normal", "important", "critical"],

    // For per-user notifications (non-global):
    isRead: { type: Boolean, default: false },

    // For global notifications: store which users have read it
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
     createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", NotificationSchema);
