import mongoose from "mongoose";

const investmentPlanSchema = new mongoose.Schema({
  title: { type: String, required: true },
  minAmount: { type: Number, required: true },
  maxAmount: { type: Number, required: true },
  dailyROI: { type: Number, required: true },
  features: [{ type: String, required: true }],
});

export default mongoose.model("InvestmentPlans", investmentPlanSchema);
