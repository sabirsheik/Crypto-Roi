import mongoose from "mongoose";

const withdrawalRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  walletAddress: { type: String, required: true },
  amountRequested: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  approvedBy: { type: String }, // Admin name or ID
}, { timestamps: true });

export default mongoose.model("WithdrawalRequest", withdrawalRequestSchema);
