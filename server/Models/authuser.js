import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  investment: { type: Number, default: 0 },
  main: { type: Number, default: 0 },
  cashbox: { type: Number, default: 0 },
  split: { type: Number, default: 0 },
  profit: { type: Number, default: 0 },
  affiliate: { type: Number, default: 0 }
});

// Investment Slot Schema
const investmentSlotSchema = new mongoose.Schema({
  slotId: { type: String, required: true },       // UUID
  amount: { type: Number, required: true },
  originalAmount: { type: Number, required: true },
  roiPercent: { type: Number, required: true },   // 1%, 1.2%, etc
  approvedAt: { type: Date, required: true },     // When approved
  lastPaidAt: { type: Date },                     //  Last time ROI was paid
  accumulatedProfit: { type: Number, default: 0 },
  roiLogs: [
    {
      type: { type: String, enum: ["credit", "deduct"] },
      amount: Number,
      timestamp: Date,
    }
  ],
dailyHistory: [
  {
    date: { type: Date, default: Date.now },  // 👈 ab automatic har entry ka unique timestamp hoga
    roi: { type: Number, default: 0 },
    deducted: { type: Number, default: 0 },
    remainingCapital: { type: Number, default: 0 },
  }
],
  status: {
    type: String,
    enum: ["active", "completed"],
    default: "active",
  },
});




//  Main User Schema
const userSchema = new mongoose.Schema({
  customId: { type: String, unique: true }, // ATW123456
  name: String,
  email: { type: String, unique: true },
  password: String,
  country: String,
  countryCode: String,
  phone: String,

  referralCode: { type: String, unique: true, sparse: true },
  referrerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }, //  indexed for MLM lookups
  role: { type: String, enum: ["user", "manager", "admin"], default: "user" },

  referralLink: { type: String, unique: true, sparse: true },
  wallets: walletSchema,
  lifetimeProfit: { type: Number, default: 0 },
  profitWithdrawn: { type: Number, default: 0 },
  investmentSlots: [investmentSlotSchema],
  lifetimeInvestment: { type: Number, default: 0 },
  lifetimeAffiliateEarnings: { type: Number, default: 0 }, //  total commissions earned
  directRefCount: { type: Number, default: 0 }, //  updated when new direct joins

  teamBusiness: {
    type: Map,
    of: Number,
    default: {}
  },
  userStatus: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },

  level: { type: Number, default: 0 },
  businessLevel: { type: Number, default: 0 },
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorVerified: { type: Boolean, default: false },
  otpCode: String,
  otpExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now },
  permissions: {
    manageUsers: { type: Boolean, default: false },
    investmentPlans: { type: Boolean, default: false },
    deposit: { type: Boolean, default: false },
    withdrawals: { type: Boolean, default: false },
    commissionLogs: { type: Boolean, default: false },
    mlmTree: { type: Boolean, default: false }
  }
});

export default mongoose.model('User', userSchema);
