// Server/Routes/admin/superAdminRoute.js
import express from "express";
import { auth } from "../../Middleware/auth/auth.js";
import requireSuperAdmin from "../../Middleware/superAdmin.js";

const router = express.Router();

// GET example route: only for super admin
router.get("/super-admin", auth, requireSuperAdmin, (req, res) => {
  return res.json({
    message: "Welcome Super Admin",
    email: req.user?.email || null
  });
});

export default router;
