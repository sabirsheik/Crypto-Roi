// models/userInvestment.js
import mongoose from "mongoose";

const investmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Users", required: true },
  amount: { type: Number, required: true },
  planName: { type: String, required: true }, // e.g., "Package 1"
  status: { type: String, enum: ["active", "expired"], default: "active" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Investments", investmentSchema);
