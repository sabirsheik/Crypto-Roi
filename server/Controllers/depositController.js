// controllers/depositController.js
import Deposit from "../Models/deposit.js";
import User from "../Models/authuser.js";

import sendDepositMail from "../utils/approvedDepositMail.js"

// 1️⃣ Submit Deposit
const submitDeposit = async (req, res) => {
  try {
    const { amount, transactionId } = req.body; // Now also accept transactionId
    const userId = req.user.id;
    const email = req.user.email;

    // Validation: screenshot required
    if (!req.file) {
      return res.status(400).json({ message: "Screenshot is required." });
    }

    // Validation: transactionId required
    if (!transactionId || transactionId.trim() === "") {
      return res.status(400).json({ message: "Transaction ID is required." });
    }

    // Optional: Validate BEP20 TxID format (usually 66 chars starting with '0x')
    if (!/^0x([A-Fa-f0-9]{64})$/.test(transactionId.trim())) {
      return res.status(400).json({ message: "Invalid Transaction ID format." });
    }

    const screenshotUrl = `/uploads/${req.file.filename}`;

    const deposit = new Deposit({
      userId,
      email,
      amount,
      transactionId: transactionId.trim(), // Save TxID
      screenshot: screenshotUrl,
      status: "pending",
    });

    await deposit.save();
    res.status(201).json({ message: "Deposit submitted. Awaiting admin approval." });

  } catch (error) {
    console.error("Deposit error:", error.message);
    res.status(500).json({ message: "Failed to submit deposit." });
  }
};


// 2️⃣ Get All Deposits
const getAllDeposits = async (req, res) => {
  try {
    const deposits = await Deposit.find(
      {}, // ✅ filter (empty means all)
      `
        userId
        email
        amount
        transactionId
        screenshot
        status
        createdAt
        processed
      `
    )
    .sort({ createdAt: -1 })
    .lean();

    res.json(deposits);
  } catch (error) {
    console.error("Error fetching deposits:", error);
    res.status(500).json({ message: "Failed to fetch deposits." });
  }
};



const approveDeposit = async (req, res) => {
  try {
    const depositId = req.params.id;

    // 1. Find deposit
    const deposit = await Deposit.findById(depositId);
    if (!deposit) return res.status(404).json({ message: "Deposit not found" });
    if (deposit.status !== "pending") return res.status(400).json({ message: "Already processed" });

    // 2. Find user
    const user = await User.findById(deposit.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 3. Ensure wallets exist
    if (!user.wallets) {
      user.wallets = {
        investment: 0,
        main: 0,
        split: 0,
        cashbox: 0,
        profit: 0,
        affiliate: 0,
      };
    }

    // 4. No deduction — full amount goes to Main Wallet
    const approvedAmount = deposit.amount;

    // 5. Credit Main Wallet
    user.wallets.main += approvedAmount;

    // 6. Update status
    deposit.status = "approved";

    // 7. Save changes
    await user.save();
    await deposit.save();

    await sendDepositMail({
      name: user.name,
      email: user.email,
      amount: approvedAmount,
    });


    // 8. Trigger MLM bonus


    return res.status(200).json({ message: "Deposit approved and added to Main Wallet" });
  } catch (error) {
    console.error("approveDeposit error:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};



const rejectDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const deposit = await Deposit.findById(id);
    if (!deposit) return res.status(404).json({ message: "Deposit not found" });

    const user = await User.findById(deposit.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    deposit.status = "rejected";
    await deposit.save();

    // ✅ Notify user of rejection
    if (global.io) {
      global.io.to(user._id.toString()).emit("depositRejected", {
        message: "Your deposit has been rejected!",
      });
    }

    res.json({ message: "Deposit rejected." });
  } catch (err) {
    console.error("Reject error:", err);
    res.status(500).json({ message: "Error rejecting deposit" });
  }
};

// 5️⃣ Get My Deposits
const getMyDeposits = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const myDeposits = await Deposit.find(
      { userId }, // ✅ filter deposits for the logged-in user
      `
        userId
        email
        amount
        transactionId
        screenshot
        status
        processed
        createdAt
      `
    )
    .sort({ createdAt: -1 })
    .lean();

    res.json(myDeposits);
  } catch (error) {
    // console.error("Error fetching user deposits:", err);
    next(error)
    // res.status(500).json({ message: "Failed to fetch your deposits." });
  }
};


// 6️⃣ Delete Deposit (Admin Only or Protected)

const deleteDeposit = async (req, res, next) => {
  try {
    const { ids } = req.body;

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No IDs provided" });
    }

    // Delete deposits matching IDs
    const deleted = await Deposit.deleteMany({
      _id: { $in: ids }
    });

    return res.status(200).json({
      message: `${deleted.deletedCount} deposit(s) deleted successfully`
    });
  } catch (error) {
    // console.error("Bulk delete error:", error.message);
    // return res.status(500).json({ message: "Failed to delete deposits" });
    next(error);
  }
};




export {
  submitDeposit,
  getAllDeposits,
  approveDeposit,
  rejectDeposit,
  getMyDeposits,
  deleteDeposit,
};
