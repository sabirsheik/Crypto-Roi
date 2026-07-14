import express from "express";
import { auth, checkRole } from "../../Middleware/auth/auth.js";
import {
  createManager,
  updateManagerAccess,
  getManagers,
  deleteManager
} from "../../Controllers/admin/Access.js";

const router = express.Router();

// Create Manager - admin only
router.post("/managers", auth, checkRole(["admin"]), createManager);

// Update manager permissions - admin only
router.put("/managers/:managerId/permissions", auth, checkRole(["admin", "manager"]), updateManagerAccess);

// Get all managers
router.get("/managers", auth, checkRole(["admin"]), getManagers);

// Delete manager
router.delete("/managers/:managerId", auth, checkRole(["admin"]), deleteManager);

export default router;
