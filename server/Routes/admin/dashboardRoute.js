// Routes/admin/dashboardRoute.js
import express from "express";
import { getAdminDashboard, getAdminNotifications } from "../../Controllers/admin/dashboardController.js";
import { auth, checkRole } from "../../Middleware/auth/auth.js"; // you already have this
const router = express.Router();


router.get("/dashboard", auth, checkRole(["admin", "manager"]), getAdminDashboard);
router.get("/notifications", auth, checkRole(["admin", "manager"]), getAdminNotifications);

export default router;
