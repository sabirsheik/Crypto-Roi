import cron from "node-cron";
import User from "../Models/authuser.js";

// ROI rate based on amount
const getRoiRate = (amount) => {
  if (amount >= 10 && amount <= 1000000) return 1.0;
  if (amount >= 1000001 && amount <= Infinity) return 1.0;
  return 1.0;
};

// Apply ROI logic with fixed decimal ROI and deduction (0.5%)
const applyRoiToSlot = (slot, now) => {
  if (!slot.originalAmount) slot.originalAmount = Number(slot.amount);

  const roiPercent = getRoiRate(slot.originalAmount); // e.g., 1.0%
  let roiRaw = (slot.originalAmount * roiPercent) / 100;
  let roi = parseFloat(roiRaw.toFixed(2)); // ✅ ROI fixed to 2 decimals

  const deductionRaw = (slot.originalAmount * 0.5) / 100;
  const deducted = parseFloat(deductionRaw.toFixed(2)); // ✅ Deduct fixed 0.5%

  const maxProfitAllowed = slot.originalAmount * 2;
  const projectedProfit = Number(slot.accumulatedProfit || 0) + roi;

  // Prevent exceeding max profit
  if (projectedProfit > maxProfitAllowed) {
    roi = parseFloat(
      (maxProfitAllowed - Number(slot.accumulatedProfit || 0)).toFixed(2)
    );
  }

  slot.accumulatedProfit = parseFloat(
    (Number(slot.accumulatedProfit || 0) + roi).toFixed(2)
  );

  slot.amount = parseFloat((Number(slot.amount) - deducted).toFixed(2));
  if (slot.amount < 0) slot.amount = 0;

  slot.lastPaidAt = now;

  // ROI logs
  slot.roiLogs = slot.roiLogs || [];
  if (roi > 0) slot.roiLogs.push({ type: "credit", amount: roi, timestamp: now });
  if (deducted > 0) slot.roiLogs.push({ type: "deduct", amount: deducted, timestamp: now });

  // Daily history log
  slot.dailyHistory = slot.dailyHistory || [];
  slot.dailyHistory.push({
    date: now.toISOString(),
    roi,
    deducted,
    remainingCapital: slot.amount,
  });

  // 🚩 Mark completed if reached cap
  if (slot.accumulatedProfit >= maxProfitAllowed) {
    slot.status = "completed";
  }

  return { roi, deducted };
};

// Cron job runner
const runDailyRoiCron = () => {
  cron.schedule("* * * * *", async () => {
    console.log("⏱ Running ROI Cron every 1 minute");


    try {
      const users = await User.find({ "investmentSlots.0": { $exists: true } });

      for (const user of users) {
        let updated = false;
        const now = new Date();

        // ✅ Track this cycle's total credited ROI for lifetimeProfit
        let cycleRoiTotal = 0;

        user.investmentSlots.forEach((slot, index) => {
          slot.amount = Number(slot.amount || 0);
          slot.accumulatedProfit = Number(slot.accumulatedProfit || 0);
          slot.originalAmount = Number(slot.originalAmount || slot.amount);

          let lastPaid = slot.lastPaidAt;
          if (!lastPaid) {
            // Agar pehli dafa ROI hai to approvedAt + 1 hour se count karo
            lastPaid = new Date(new Date(slot.approvedAt).getTime() + 24 * 60 * 60 * 1000);
          }
          // const lastPaid = slot.lastPaidAt || slot.approvedAt;
          const minutesSinceLast = (now - new Date(lastPaid)) / (1000 * 60);


          // 🧪 Log slot status
          console.log(
            `🧪 User: ${user.email} | Slot ${index + 1} | Amount: ${slot.amount}, Accumulated: ${slot.accumulatedProfit}, Minutes since last: ${minutesSinceLast.toFixed(2)}`
          );
          const diffMs = now - new Date(lastPaid);
          const diffMinutes = diffMs / (1000 * 60);
          if (
            slot.amount > 0 &&
            slot.status !== "completed" &&
            diffMinutes >= 1440 && diffMinutes < 1500 // 24h–25h
          ) {
            const { roi, deducted } = applyRoiToSlot(slot, now);
            console.log(`🎯 ${user.email} | +$${roi} profit | -$${deducted} capital`);
            updated = true;

            // ⬅️ Collect cycle ROI (we will add to lifetimeProfit once per cycle)
            cycleRoiTotal = parseFloat((cycleRoiTotal + roi).toFixed(2));

            // Notifications
            user.notifications = user.notifications || [];
            user.notifications.push({
              type: "roi-credit",
              title: "ROI Credited",
              message: `+$${roi} profit added. -$${deducted} reinvested.`,
              createdAt: now,
              read: false,
            });
          }
        });

        // ✅ Single reliable write to lifetimeProfit per cycle
        if (updated) {
          user.lifetimeProfit = parseFloat(
            (Number(user.lifetimeProfit || 0) + Number(cycleRoiTotal || 0)).toFixed(2)
          );
          user.markModified("lifetimeProfit");

          const totalProfit = user.investmentSlots.reduce(
            (sum, s) => sum + (Number(s.accumulatedProfit) || 0),
            0
          );
          const totalInvestment = user.investmentSlots.reduce(
            (sum, s) => sum + (s.amount > 0 ? Number(s.amount) : 0),
            0
          );

          // Update wallets (current balances)
          user.wallets.profit = parseFloat(totalProfit.toFixed(2));
          user.wallets.investment = parseFloat(totalInvestment.toFixed(2));

          user.markModified("investmentSlots");
          user.markModified("wallets");
          user.markModified("notifications");

          await user.save({ optimisticConcurrency: false });
          console.log(
            `💾 Updated: ${user.email} | Profit: $${totalProfit} | Investment: $${totalInvestment} | LifetimeProfit +$${cycleRoiTotal} = $${user.lifetimeProfit}`
          );
        }
      }

      console.log("✅ ROI Cron Job Complete");
    } catch (err) {
      console.error("❌ ROI Cron Error:", err.message);
    }
  },
    {
      scheduled: true,
      timezone: "Europe/London"
    });
};

export default runDailyRoiCron;