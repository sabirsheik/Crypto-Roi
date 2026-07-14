import express from "express";
import { requestWithdrawal, adminUpdateWithdrawalStatus,
    getAllWithdrawals,
    getMyWithDrawal,
    deleteWithdrawals
 } from "../Controllers/withdrawalController.js";
import {auth, checkRole} from "../Middleware/auth/auth.js"; 

const router = express.Router();



//  User submits withdrawal
router.post("/request", auth, requestWithdrawal);

// 
router.get("/all", auth, checkRole(["admin", "manager"]), getAllWithdrawals); 
router.get("/my-withdrawals", auth, getMyWithDrawal); 
// Admin approves/rejects
router.post("/admin/update-status", auth, checkRole(["admin", "manager"]), adminUpdateWithdrawalStatus);
router.post("/admin/delete", auth, checkRole(["admin", "manager"]), deleteWithdrawals);


export default router;
