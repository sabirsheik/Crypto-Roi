import express from "express";
import { getUserNotifications, markAsRead, createNotification, deleteNotification } from "../../Controllers/admin/notificationController.js";
import { auth, checkRole } from "../../Middleware/auth/auth.js";

const router = express.Router();

// ✅ Get user notifications
router.get("/notifications", auth, getUserNotifications);

router.post("/admin/notifications/send", auth, checkRole(["admin", "manager"]), createNotification);


// ✅ Mark as read
router.patch("/notifications/:notificationId/read", auth, markAsRead);


router.delete("/:notificationId", auth, deleteNotification);

export default router;
