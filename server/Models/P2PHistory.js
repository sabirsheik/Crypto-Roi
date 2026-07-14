// models/p2pTransaction.js
import mongoose from "mongoose";

const p2pTransactionSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    walletType: {
      type: String,
      enum: ["main", "split", "cashbox"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Amount must be greater than 0"],
    },
    otpVerified: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt automatically
  }
);

const P2PTransaction = mongoose.model("P2PTransaction", p2pTransactionSchema);
export default P2PTransaction;
