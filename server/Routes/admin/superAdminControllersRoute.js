import express from "express";
import { auth } from "../../Middleware/auth/auth.js"; 
import requireSuperAdmin from "../../Middleware/superAdmin.js";
import {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../../Controllers/admin/superAdminController.js";

const router = express.Router();

// Protect these routes for super admin only
router.use(auth, requireSuperAdmin);

router.get("/admins", getAdmins);
router.post("/create", createAdmin);

// use id (Mongo _id) for update/delete:
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

export default router;
