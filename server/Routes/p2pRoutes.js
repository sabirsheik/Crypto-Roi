import mongoose from "mongoose"
import express from "express";
import User from "../Models/authuser.js";
import P2PTransaction from "../Models/P2PHistory.js";
import sendP2PTranstion from "../utils/sendP2PMail.js";
import sendP2PMail from "../utils/P2PFundsOtp.js";
import { auth, checkRole } from "../Middleware/auth/auth.js"
import { p2pOtpLimit, p2pTransferLimit } from "../handlers/p2pLimiters.js";
const router = express.Router();

// In-memory stores
const otpStore = {};      // { email: { otp, expires } }
const verifiedStore = {}; // { email: true }

// ✅ POST: /api/p2p/send-otp
router.post("/send-otp", p2pOtpLimit, async (req, res) => {
  try {
    const { amount, walletType, senderEmail } = req.body;

    if (!senderEmail) {
      return res.status(400).json({ message: "Sender email is required" });
    }

    const sender = await User.findOne({ email: senderEmail });
    if (!sender) {
      return res.status(404).json({ message: "Sender not found" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[senderEmail] = {
      otp,
      amount,
      walletType,
      expires: Date.now() + 5 * 60 * 1000, // 5 min
    };

    // Send OTP email
    await sendP2PMail({
      to: senderEmail,
      otp, // ✅ Pass OTP to email template
      email: process.env.EMAIL_USER
    });

    return res.status(200).json({ message: "OTP sent successfully" });
  } catch (err) {
    console.error("OTP Send Error:", err);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
});

// ✅ POST: /api/p2p/verify-otp
router.post("/verify-otp", async (req, res) => {
  try {
    const { otp, senderEmail } = req.body;

    if (!otp) {
      return res.status(400).json({ message: "OTP required" });
    }

    const otpData = otpStore[senderEmail];
    if (!otpData) {
      return res.status(400).json({ message: "OTP not found. Please request again." });
    }

    if (otpData.expires < Date.now()) {
      delete otpStore[senderEmail];
      return res.status(400).json({ message: "OTP expired" });
    }

    if (otpData.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark as verified
    verifiedStore[senderEmail] = true;

    // Remove OTP after verification
    delete otpStore[senderEmail];

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error("OTP Verify Error:", err);
    return res.status(500).json({ message: "Failed to verify OTP" });
  }
});
// ✅ POST: /api/p2p/transfer
router.post("/transfer", p2pTransferLimit, async (req, res) => {
  try {
    const { id: receiverId, amount, senderEmail, walletType } = req.body;

    if (!receiverId || !amount || !walletType) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if OTP was verified
    if (!verifiedStore[senderEmail]) {
      return res.status(400).json({ message: "Please verify OTP before transfer" });
    }

    // Clear verification after one transfer
    delete verifiedStore[senderEmail];

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    // ✅ Minimum transfer condition
    if (amt < 5) {
      return res.status(400).json({ message: "Minimum transfer amount is $5" });
    }
    const allowedWallets = ["main", "cashbox", "split"];
    const walletKey = walletType.toLowerCase();

    if (!allowedWallets.includes(walletKey)) {
      return res.status(400).json({ message: "Invalid wallet type" });
    }

    const sender = await User.findOne({ email: senderEmail });
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "Sender or receiver not found" });
    }

    if (sender._id.toString() === receiver._id.toString()) {
      return res.status(400).json({ message: "Cannot transfer to yourself" });
    }

    sender.wallets = sender.wallets || { investment: 0, main: 0, split: 0, cashbox: 0, profit: 0, affiliate: 0 };
    receiver.wallets = receiver.wallets || { investment: 0, main: 0, split: 0, cashbox: 0, profit: 0, affiliate: 0 };

    if (typeof sender.wallets[walletKey] !== "number" || sender.wallets[walletKey] < amt) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Transfer funds
    sender.wallets[walletKey] -= amt;
    receiver.wallets.main += amt;

    await sender.save();
    await receiver.save();

    await P2PTransaction.create({
      sender: sender._id,
      receiver: receiver._id,
      senderEmail: sender.email,
      receiverEmail: receiver.email,
      walletType,
      amount: amt,
      otpVerified: true,
      status: "completed",
    });

    await sendP2PTranstion({
      to: receiver.email,
      receiverName: receiver.name || receiver.email,
      amount: amt,
      fromEmail: sender.email,
    });

    return res.status(200).json({
      message: `Transferred $${amt.toFixed(2)} from ${walletKey} wallet to ${receiver.email}'s Main Wallet`,
    });
  } catch (err) {
    console.error("Transfer Error:", err);
    return res.status(500).json({ message: "Transfer failed due to server error" });
  }
});

// ✅ GET: /api/p2p/history/:userId
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const history = await P2PTransaction.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "email")
      .populate("receiver", "email");

    return res.status(200).json(history);
  } catch (err) {
    console.error("History fetch error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


router.get("/admin/history", auth, checkRole(["admin", "manager"]), async (req, res) => {
  try {

    const history = await P2PTransaction.find({})
      .sort({ createdAt: -1 })
      .populate("sender", "email")
      .populate("receiver", "email");

    return res.status(200).json(history);
  } catch (err) {
    console.error("Admin history fetch error:", err);
    return res.status(500).json({ message: "Failed to fetch P2P history" });
  }
});


// routes/p2pTransfer.js
router.delete(
  "/admin/delete/:id",
  auth,
  checkRole(["admin", "manager"]),
  async (req, res) => {
    try {
      const { id } = req.params;

      // Validate Mongo ObjectId format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid transaction ID" });
      }

      const transaction = await P2PTransaction.findById(id);
      if (!transaction) {
        return res.status(404).json({ message: "P2P transaction not found" });
      }

      await P2PTransaction.findByIdAndDelete(id);

      return res.status(200).json({ message: "P2P transaction deleted successfully" });
    } catch (err) {
      console.error("P2P Delete Error:", err);
      return res.status(500).json({ message: "Failed to delete P2P transaction" });
    }
  }
);



export default router;
