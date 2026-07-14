// routes/admin/mlmTreeRoute.js
import express from "express";
import { getMLMTree, getAllMLMTrees } from "../../Controllers/admin/mlmTreeController.js";
import { auth, checkRole } from "../../Middleware/auth/auth.js";

const router = express.Router();


router.get("/all", auth, checkRole(["admin", "manager"]), getAllMLMTrees);
router.get("/:userId", auth, getMLMTree);

export default router;
