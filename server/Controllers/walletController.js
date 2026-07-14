import User from "../Models/authuser.js";
import mongoose from "mongoose";
import distributeMLMBonus from "../utils/distributeMLMBonus.js";
import TransactionHistory from "../Models/TransactionHistory.js";
import { v4 as uuidv4 } from 'uuid';

const recalculateWallets = (user) => {
  if (!user || !user.investmentSlots) return user;

  const totalInvestment = user.investmentSlots.reduce(
    (sum, slot) => sum + (slot.amount || 0),
    0
  );

  const totalProfit = user.investmentSlots.reduce(
    (sum, slot) => sum + (slot.accumulatedProfit || 0),
    0
  );

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

  user.wallets.investment = parseFloat(totalInvestment.toFixed(2));
  user.wallets.profit = parseFloat(totalProfit.toFixed(2));

  return user;
};

const getROIPercent = (amount) => {
  if (amount >= 10 && amount <= 1000000) return 1.0;
  if (amount >= 1000001 && amount <= Infinity) return 1.0;
  return 1.0;
};

const createNewSlot = (amount) => {
  const roiPercent = getROIPercent(amount);
  return {
    slotId: uuidv4(),
    amount: parseFloat(amount.toFixed(2)),
    originalAmount: parseFloat(amount.toFixed(2)),
    roiPercent,
    approvedAt: new Date(),
    accumulatedProfit: 0,
    roiLogs: [],
  };
};

// Main Wallet → Investment
const mainToInvestmentTransfer = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { amount } = req.body;
    const amt = parseFloat(amount);

    if (amt < 10) return res.status(400).json({ message: "Minimum investment is $10." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.wallets.main < amt) return res.status(400).json({ message: "Insufficient balance." });

    // 💸 Deduct full amount from main wallet
    user.wallets.main -= amt;

    // 🎯 Invest amount minus $1.5 fee
    const netInvestment = amt - 1.5;
    user.investmentSlots.push(createNewSlot(netInvestment));

    // 🧮 Track total lifetime investment
    user.lifetimeInvestment = user.lifetimeInvestment || 0;
    user.lifetimeInvestment += amt;

    // 🧱 Define levels
    const levels = [
      { level: 1, min: 10, max: 100 },
      { level: 2, min: 101, max: 200 },
      { level: 3, min: 201, max: 400 },
      { level: 4, min: 401, max: 800 },
      { level: 5, min: 801, max: 1600 },
      { level: 6, min: 1601, max: 3200 },
      { level: 7, min: 3201, max: 6400 },
      { level: 8, min: 6401, max: 12800 },
      { level: 9, min: 12801, max: 25600 },
      { level: 10, min: 25601, max: 51200 },
      { level: 11, min: 51201, max: 102400 },
      { level: 12, min: 102401, max: Infinity },
    ];

    // 🧠 Calculate current level based on lifetime investment
    const currentLevel = levels.find(l =>
      user.lifetimeInvestment >= l.min && user.lifetimeInvestment <= l.max
    )?.level;

    // 📌 Only increase level if it's higher
    if (!user.level || currentLevel > user.level) {
      user.level = currentLevel;
    }

    recalculateWallets(user);
    user.markModified("investmentSlots");
    user.markModified("wallets");
    await user.save();

    // ✅ Save Transaction History
    await TransactionHistory.create({
      userId: user._id,
      type: "transfer",
      fromWallet: "main",
      toWallet: "investment",
      amount: amt,
      fee: 1.5,
      status: "completed"
    });

    setTimeout(() => {
      distributeMLMBonus(user, netInvestment); // ✅ Fee cut hone ke baad commission
    }, 1000);

    res.status(200).json({
      message: `Invested $${netInvestment.toFixed(2)} successfully (Fee: $1.5 deducted from $${amt.toFixed(2)})`,
      wallets: user.wallets,
      level: user.level,
    });
  } catch (error) {
    next(error);
  }
};

// Profit → Cashbox
const profitToCashboxTransfer = async (req, res) => {
  try {
    const userId = req.user._id;
    const { amount } = req.body;
    const amt = parseFloat(amount);

    if (!amt || isNaN(amt) || amt < 5) {
      return res.status(400).json({ message: "Invalid amount. Minimum is $5." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // ✅ Calculate total profit and how much is left to withdraw (using lifetimeProfit)
    // const totalProfit = user.lifetimeProfit || 0;   // 🔥 fixed, permanent tracker
    const withdrawn = user.profitWithdrawn || 0;
    const availableProfit = (user.lifetimeProfit || 0) - (user.profitWithdrawn || 0);



    if (availableProfit < amt) {
      return res.status(400).json({ message: "Insufficient available profit." });
    }

    // ✅ Update profitWithdrawn tracker
    user.profitWithdrawn = withdrawn + amt;

    // ✅ Wallet Distribution
    const toCashbox = amt * 0.70;
    const toReinvest = amt * 0.20;
    const toSplit = amt * 0.05;
    const fee = amt * 0.05; // Not used here but kept for transparency

    user.wallets.cashbox += toCashbox;
    user.wallets.split += toSplit;

    // ✅ Create reinvestment slot
    user.investmentSlots.push(createNewSlot(toReinvest));

    // ✅ Final recalculation and save
    recalculateWallets(user);
    user.markModified("wallets");
    user.markModified("investmentSlots");
    await user.save();
await TransactionHistory.create({
  userId: user._id,
  type: "transfer",
  fromWallet: "profit",
  amount: amt,       // total amount (100 for example)
  fee: fee,          // total fee (5 for example)
  status: "completed",
  details: {
    breakdown: [
      { wallet: "Cashbox", amount: toCashbox, percentage: 70 },
      { wallet: "Reinvest", amount: toReinvest, percentage: 20 },
      { wallet: "Split", amount: toSplit, percentage: 5 },
      { wallet: "Fee", amount: fee, percentage: 5 }
    ]
  }
});


    setTimeout(() => {
      distributeMLMBonus(user, toReinvest); // ✅ Fee cut hone ke baad commission
    }, 1000);

    res.status(200).json({
      message: `Profit transferred successfully: $${toCashbox.toFixed(2)} to Cashbox, $${toReinvest.toFixed(2)} reinvested, $${toSplit.toFixed(2)} to Split.`,
      wallets: user.wallets,
      availableProfit: availableProfit - amt   // ✅ new balance after withdrawal
    });
  } catch (err) {
    console.error("profitToCashboxTransfer error:", err);
    res.status(500).json({ message: "Server error." });
  }
};

// Cashbox → Wallet or Investment
const cashboxToWallet = async (req, res) => {
  try {
    const { to, amount } = req.body;
    const userId = req.user._id;
    const amt = parseFloat(amount);

    const validDestinations = ["main", "investment", "split"];
    if (!validDestinations.includes(to)) {
      return res.status(400).json({ message: "Invalid destination" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.wallets.cashbox < amt) {
      return res.status(400).json({ message: "Insufficient Cashbox balance" });
    }

    user.wallets.cashbox -= amt;

    if (to === "investment") {
      user.investmentSlots.push(createNewSlot(amt));
    } else {
      user.wallets[to] += amt;
    }

    recalculateWallets(user);
    user.markModified("investmentSlots");
    user.markModified("wallets");
    await user.save();

    await TransactionHistory.create({
      userId: user._id,
      type: "transfer",
      fromWallet: "cashbox",
      toWallet: to,
      amount: amt,
      fee: 0,
      status: "completed"
    });

    res.status(200).json({
      message: `Transferred $${amt.toFixed(2)} to ${to}`,
      wallets: user.wallets,
    });
  } catch (err) {
    console.error("cashboxToWallet error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Cashbox → New Investment Slot
const cashboxToNewSlotTransfer = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;
    const amt = parseFloat(amount);

    if (!amount || isNaN(amt) || amt <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.wallets.cashbox < amt) {
      return res.status(400).json({ message: "Insufficient CashBox balance" });
    }

    const roiPercent = getROIPercent(amt);

    user.wallets.cashbox -= amt;

    user.investmentSlots.push({
      slotId: new mongoose.Types.ObjectId().toString(),
      amount: amt,
      originalAmount: amt,
      roiPercent,
      approvedAt: new Date(),
      accumulatedProfit: 0,
      roiLogs: [],
    });

    recalculateWallets(user);
    await user.save();

    setTimeout(() => {
      distributeMLMBonus(user, amt); 
    }, 1000);

    await TransactionHistory.create({
      userId: user._id,
      type: "transfer",
      fromWallet: "cashbox",
      toWallet: "investment",
      amount: amt,
      status: "completed"
    });

    return res.status(200).json({
      message: `Successfully transferred $${amt.toFixed(2)} (after fee) to a new investment slot`,
      wallets: user.wallets,
      investmentSlots: user.investmentSlots,
    });
  } catch (err) {
    console.error("cashboxToNewSlotTransfer error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Affiliate → Cashbox + Reinvest
const affiliateToCashboxTransfer = async (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user._id;
    const amt = parseFloat(amount);

    if (!amt || amt < 5)
      return res.status(400).json({ message: "Minimum amount is $5" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.wallets.affiliate < amt)
      return res.status(400).json({ message: "Insufficient Affiliate Wallet" });

    user.wallets.affiliate -= amt;

    const toCashbox = amt * 0.70;
    const toReinvest = amt * 0.20;
    const toSplit = amt * 0.05;
    const fee = amt * 0.05;

    user.wallets.cashbox += toCashbox;
    user.wallets.split += toSplit;
    user.investmentSlots.push(createNewSlot(toReinvest));

    recalculateWallets(user);
    user.markModified("investmentSlots");
    user.markModified("wallets");
    await user.save();

await TransactionHistory.create({
  userId: user._id,
  type: "transfer", // ✅ valid
  fromWallet: "affiliate",
  toWallet: "cashbox", // optional (main destination wallet)
  amount: amt,         // e.g. 100
  fee: fee,            // e.g. 5
  status: "completed",
  details: {
    breakdown: [
      { wallet: "Cashbox", amount: toCashbox, percentage: 70 },
      { wallet: "Reinvest", amount: toReinvest, percentage: 20 },
      { wallet: "Split", amount: toSplit, percentage: 5 },
      { wallet: "Fee", amount: fee, percentage: 5 }
    ]
  }
});


    setTimeout(() => {
      distributeMLMBonus(user, toReinvest); // ✅ Fee cut hone ke baad commission
    }, 1000);
    res.status(200).json({
      message: `Affiliate transferred: Cashbox $${toCashbox.toFixed(2)}, Reinvested $${toReinvest.toFixed(2)}, Split $${toSplit.toFixed(2)}, Fee $${fee.toFixed(2)}`,
      wallets: user.wallets
    });
  } catch (err) {
    console.error("affiliateToCashboxTransfer error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete Slot
const deleteInvestmentSlot = async (req, res) => {
  try {
    const { slotId } = req.params;
    const userId = req.user.id;

    // 1️⃣ User find karo
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 2️⃣ Ensure slots exist
    if (!Array.isArray(user.investmentSlots)) {
      user.investmentSlots = [];
    }

    // 3️⃣ Find slot index
    const slotIndex = user.investmentSlots.findIndex(
      slot => slot.slotId === slotId
    );
    if (slotIndex === -1) {
      return res.status(404).json({ message: "Investment slot not found." });
    }

    // 4️⃣ Check amount before deletion
    const slot = user.investmentSlots[slotIndex];
    if (slot.amount > 0) {
      return res.status(400).json({ message: "Slot must be zero before deletion." });
    }

    // 5️⃣ Delete slot (lifetimeProfit untouched)
    user.investmentSlots.splice(slotIndex, 1);

    // 6️⃣ Save user
    await user.save();

    return res.json({
      message: "Investment slot deleted successfully.",
      availableProfit: (user.lifetimeProfit || 0) - (user.profitWithdrawn || 0) // 👈 hamesha correct dikhega
    });
  } catch (error) {
    console.error("Error deleting slot:", error);
    return res.status(500).json({ message: "Error deleting investment slot." });
  }
};


export {
  mainToInvestmentTransfer,
  profitToCashboxTransfer,
  cashboxToWallet,
  cashboxToNewSlotTransfer,
  affiliateToCashboxTransfer,
  deleteInvestmentSlot
};
