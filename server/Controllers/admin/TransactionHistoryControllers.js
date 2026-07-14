import mongoose from "mongoose";
import TransactionHistory from "../../Models/TransactionHistory.js";

// ✅ Get all transactions (Admin Panel) - all users with full detail
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await TransactionHistory.find()
      .populate("userId", "customId name email")
      .sort({ createdAt: -1 });

    const formatted = transactions.map(tx => ({
      id: tx._id,
      user: {
        id: tx.userId?._id,
        customId: tx.userId?.customId,
        name: tx.userId?.name,
        email: tx.userId?.email,
      },
      type: tx.type,                      
      from: tx.fromWallet || "N/A",
      to: tx.toWallet || "N/A",
      amount: `$${tx.amount.toFixed(2)}`,
      fee: `$${tx.fee.toFixed(2)}`,
      status: tx.status,
      date: tx.createdAt,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      transactions: formatted,
    });
  } catch (err) {
    console.error("getAllTransactions error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching transactions",
      error: err.message,
    });
  }
};

// ✅ Get transactions of single user (only his wallet transfers)
// const getUserTransactions = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(userId)) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid user ID" });
//     }

//     // sirf user ke apne wallets ke transfers
//     const transactions = await TransactionHistory.find({
//       userId,
//       fromWallet: { $exists: true },
//       toWallet: { $exists: true }
//     }).sort({ createdAt: -1 });

//     const formatted = transactions.map(tx => ({
//       id: tx._id,
//       type: tx.type,
//       from: tx.fromWallet || "N/A",
//       to: tx.toWallet || "N/A",
//       amount: `$${tx.amount.toFixed(2)}`,
//       fee: `$${tx.fee.toFixed(2)}`,
//       status: tx.status,
//       date: tx.createdAt,
//     }));

//     res.status(200).json({
//       success: true,
//       count: formatted.length,
//       transactions: formatted,
//     });
//   } catch (err) {
//     console.error("getUserTransactions error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching user transactions",
//       error: err.message,
//     });
//   }
// };

const getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid user ID" });
    }

    const transactions = await TransactionHistory.find({ userId })
      .sort({ createdAt: -1 });

    const formatted = transactions.map(tx => ({
      id: tx._id,
      type: tx.type,
      from: tx.fromWallet || "System",
      to: tx.toWallet || (tx.details?.breakdown ? "Multiple Wallets" : "N/A"),
      amount: `$${tx.amount.toFixed(2)}`,
      fee: `$${tx.fee.toFixed(2)}`,
      status: tx.status,
      date: tx.createdAt,
      breakdown: tx.details?.breakdown || []
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      transactions: formatted,
    });
  } catch (err) {
    console.error("getUserTransactions error:", err);
    res.status(500).json({
      success: false,
      message: "Error fetching user transactions",
      error: err.message,
    });
  }
};

// ✅ Delete multiple transactions (Admin)
const deleteTransactions = async (req, res) => {
  try {
    const { ids } = req.body; // Array of transaction IDs

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide transaction IDs to delete.",
      });
    }

    // Validate ObjectIds
    const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid transaction IDs provided.",
      });
    }

    // Delete transactions
    const result = await TransactionHistory.deleteMany({ _id: { $in: validIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} transaction(s) deleted successfully.`,
    });
  } catch (err) {
    console.error("deleteTransactions error:", err);
    res.status(500).json({
      success: false,
      message: "Error deleting transactions",
      error: err.message,
    });
  }
};

export {
  getAllTransactions,
  getUserTransactions,
  deleteTransactions
};
