import mongoose from "mongoose";
import User from "../Models/authuser.js";
import WithdrawalRequest from "../Models/WithdrawalRequest.js";
import { sendWithdrawalStatusMail } from "../utils/withdrawalsStatus.js"; // Import mail util

const isValidBEP20Address = (address) => /^0x[a-fA-F0-9]{40}$/.test(address);

export const requestWithdrawal = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, phone, walletAddress, amount } = req.body;
    const userId = req.user._id;
    const amt = parseFloat(amount);

    // Validations
    if (!name || !email || !phone || !walletAddress || isNaN(amt)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!isValidBEP20Address(walletAddress)) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Invalid BEP20 Wallet Address" });
    }

    if (amt < 1) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Minimum withdrawal is $1" });
    }

    const user = await User.findById(userId).session(session);
    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({ message: "User not found" });
    }

    if (user.wallets.cashbox < amt) {
      await session.abortTransaction();
      return res.status(400).json({ message: "Insufficient CashBox balance" });
    }

    // Deduct amount
    user.wallets.cashbox -= amt;
    await user.save({ session });

    // Create withdrawal record
    const withdrawal = new WithdrawalRequest({
      userId,
      name,
      email,
      phone,
      walletAddress,
      amountRequested: amt,
    });

    await withdrawal.save({ session });

    // ✅ Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      message: `Withdrawal request submitted for $${amt.toFixed(2)}. Wait For Approval`,
      withdrawal,
    });

  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("requestWithdrawal error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllWithdrawals = async (req, res) => {
  try {
    const withdrawals = await WithdrawalRequest.find()
      .populate("userId", "name email") // Optional: enrich with user info
      .sort({ createdAt: -1 });

    res.status(200).json({ withdrawals });
  } catch (err) {
    console.error("getAllWithdrawals error:", err.message);
    res.status(500).json({ message: "Failed to fetch withdrawals" });
  }
};

export const adminUpdateWithdrawalStatus = async (req, res) => {
  try {
    const { withdrawalId, status, adminName } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const withdrawal = await WithdrawalRequest.findById(withdrawalId);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    const user = await User.findById(withdrawal.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (status === "approved") {
      withdrawal.status = "approved";
      withdrawal.approvedAt = new Date();
      withdrawal.approvedBy = adminName || "admin";

      // Send Approval Mail
      await sendWithdrawalStatusMail(user.email, user.name, withdrawal.amountRequested, "approved");

    } else {
      // Refund amount back to CashBox
      user.wallets.cashbox += withdrawal.amountRequested;
      await user.save();

      withdrawal.status = "rejected";
      withdrawal.rejectedAt = new Date();
      withdrawal.approvedBy = adminName || "admin";

      // Send Rejection Mail
      await sendWithdrawalStatusMail(user.email, user.fullname, withdrawal.amountRequested, "rejected");
    }

    await withdrawal.save();

    return res.status(200).json({ message: `Withdrawal ${status} successfully`, withdrawal });

  } catch (err) {
    console.error("adminUpdateWithdrawalStatus error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


export const getMyWithDrawal = async (req, res) => {
  try {
    const userId = req.user.id;
    const myWithDrawal = await WithdrawalRequest.find(
      { userId },
      { name: 1, email: 1, walletAddress: 1, amountRequested: 1, createdAt: 1, status: 1 }
    ).sort({ createdAt: -1 });

    res.json(myWithDrawal);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch your withdrawal." });
  }
};


export const deleteWithdrawals = async (req, res) => {
  try {
    const { withdrawalIds } = req.body;

    if (!Array.isArray(withdrawalIds) || withdrawalIds.length === 0) {
      return res.status(400).json({ message: "No withdrawal IDs provided" });
    }

    const result = await WithdrawalRequest.deleteMany({
      _id: { $in: withdrawalIds },
    });

    return res.status(200).json({
      message: `${result.deletedCount} withdrawal(s) deleted successfully`,
    });
  } catch (err) {
    console.error("deleteWithdrawals error:", err.message);
    res.status(500).json({ message: "Failed to delete withdrawals" });
  }
};