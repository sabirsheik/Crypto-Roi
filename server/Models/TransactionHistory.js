import mongoose from "mongoose";

const transactionHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["deposit", "withdraw", "transfer", "profit", "fee"], required: true },
  fromWallet: { type: String, default: null },
  toWallet: { type: String, default: null },
  amount: { type: Number, required: true },
  fee: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
  details: { type: Object, default: {} }, // 🔥 breakdown save here
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("TransactionHistory", transactionHistorySchema);
