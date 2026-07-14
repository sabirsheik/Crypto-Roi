import express from "express";
import {
  mainToInvestmentTransfer,
  profitToCashboxTransfer,
  cashboxToWallet,
  cashboxToNewSlotTransfer,
  affiliateToCashboxTransfer,
  deleteInvestmentSlot,
} from "../Controllers/walletController.js";
import { auth } from "../Middleware/auth/auth.js";

// import {
//   mainToInvestmentLimit,
//   profitToCashboxLimit,
//   cashboxToWalletLimit,
//   cashboxToNewSlotLimit,
//   affiliateToCashboxLimit,
// } from "../handlers/walletsTransfersLimit.js";

const router = express.Router();

// 🔹 Each route has its own limiter
router.post("/transfer/main-to-investment", auth, mainToInvestmentTransfer);
router.post("/transfer/profit-to-cashbox", auth, profitToCashboxTransfer);
router.post("/transfer/cashbox-to-wallet", auth, cashboxToWallet);
router.post("/transfer/cashbox-to-new-slot", auth, cashboxToNewSlotTransfer);
router.post("/transfer/affiliate-to-cashbox", auth, affiliateToCashboxTransfer);

router.delete("/delete-slot/:slotId", auth, deleteInvestmentSlot);

export default router;
