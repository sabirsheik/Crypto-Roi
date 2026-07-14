import express from "express";
import { getAllTransactions, getUserTransactions, deleteTransactions } from "../../Controllers/admin/TransactionHistoryControllers.js";
import { auth, checkRole } from "../../Middleware/auth/auth.js"

const router = express.Router();

router.get("/wallets/transactions-history", auth, getAllTransactions);
router.get("/transactions/:userId", auth, getUserTransactions);
router.delete("/transactions/delete", auth, deleteTransactions);    


export default router;
