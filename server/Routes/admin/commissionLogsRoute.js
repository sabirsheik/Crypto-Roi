import express from "express";
const router = express.Router();
import { getAllCommissionLogs, getUserCommissionLogs, deleteCommissions } from "../../Controllers/admin/commissionLogsController.js";
import { auth, checkRole } from "../../Middleware/auth/auth.js";


router.get("/admin/commission-logs/commission", [auth, checkRole(["admin", "manager"])], getAllCommissionLogs);

router.get("/user/logs", auth, getUserCommissionLogs);

router.delete("/user/logs/delete", auth, checkRole(["admin", "manager"]), deleteCommissions);



export default router;
