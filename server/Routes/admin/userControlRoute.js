import express from "express";
import {
  getAllUsers,
  updateUserByAdmin,
  deleteUser,
} from "../../Controllers/admin/userControl.js";
import { auth, checkRole } from "../../Middleware/auth/auth.js";

const router = express.Router();

router.get("/all-users", auth, checkRole(["admin", "manager"]), getAllUsers);
router.put("/update-user/:id", auth, checkRole(["admin", "manager"]), updateUserByAdmin);
router.delete("/delete-user/:id", auth, checkRole(["admin", "manager"]), deleteUser);

export default router;
