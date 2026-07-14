import User from "../../Models/authuser.js";
import Deposit from "../../Models/deposit.js";
import Withdrawal from "../../Models/WithdrawalRequest.js";
import Commission from "../../Models/admin/commission.js";
import P2PTransaction from "../../Models/P2PHistory.js";

export const getAdminDashboard = async (req, res, next) => {
  try {
    // ---------- 1) Total Deposits ----------
    const totalDepositsAgg = await Deposit.aggregate([
      { $match: { status: { $regex: /^approved$/i } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } },
    ]);
    const totalDeposits = totalDepositsAgg[0]?.total || 0;

    // ---------- 2) Active Investments ----------
    const activeInvestmentsAgg = await User.aggregate([
      { $unwind: { path: "$investmentSlots", preserveNullAndEmptyArrays: true } },
      { $match: { "investmentSlots.status": { $regex: /^active$/i } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$investmentSlots.amount", 0] } } } },
    ]);
    const activeInvestments = activeInvestmentsAgg[0]?.total || 0;

    // ---------- 3) Withdrawals (Approved) ----------
    const withdrawalsAgg = await Withdrawal.aggregate([
      { $match: { status: { $regex: /^approved$/i } } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$amountRequested", 0] } } } },
    ]);
    const withdrawals = withdrawalsAgg[0]?.total || 0;

    // ---------- 4) ROI Distributions ----------
    const roiAgg = await User.aggregate([
      { $unwind: { path: "$investmentSlots", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$investmentSlots.roiLogs", preserveNullAndEmptyArrays: true } },
      { $match: { "investmentSlots.roiLogs.type": "credit" } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$investmentSlots.roiLogs.amount", 0] } } } },
    ]);
    const roiDistributions = roiAgg[0]?.total || 0;

    // ---------- 5) MLM Affiliate Totals ----------
    const affiliateAgg = await User.aggregate([
      {
        $group: {
          _id: null,
          totalAffiliateEarnings: { $sum: { $ifNull: ["$lifetimeAffiliateEarnings", 0] } },
          totalDirectRefs: { $sum: { $ifNull: ["$directRefCount", 0] } },
        },
      },
    ]);
    const affiliateTotals = {
      totalAffiliateEarnings: affiliateAgg[0]?.totalAffiliateEarnings || 0,
      totalDirectRefs: affiliateAgg[0]?.totalDirectRefs || 0,
    };
    const affiliateGrowth = await User.countDocuments({ referrerId: { $ne: null } });

    // ---------- 6) Commission Breakdown ----------
    const commissionBreakdownAgg = await Commission.aggregate([
      {
        $group: {
          _id: null,
          directCommission: {
            $sum: {
              $cond: [{ $eq: ["$level", 1] }, "$commission", 0]
            }
          },
          indirectCommission: {
            $sum: {
              $cond: [{ $ne: ["$level", 1] }, "$commission", 0]
            }
          },
          totalCommission: { $sum: "$commission" }
        }
      }
    ]);

    const commissionBreakdown = commissionBreakdownAgg[0] || {
      directCommission: 0,
      indirectCommission: 0,
      totalCommission: 0
    };

    // console.log("Commission Breakdown:", commissionBreakdown);


    // ---------- 7) Weekly Growth & Profit ----------
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const weeklyProfitAgg = await User.aggregate([
      { $unwind: { path: "$investmentSlots", preserveNullAndEmptyArrays: true } },
      { $unwind: { path: "$investmentSlots.roiLogs", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          "investmentSlots.roiLogs.timestamp": { $gte: start, $lte: now },
          "investmentSlots.roiLogs.type": "credit",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$investmentSlots.roiLogs.timestamp" } },
          totalProfit: { $sum: { $ifNull: ["$investmentSlots.roiLogs.amount", 0] } },
        },
      },
    ]);

    const weeklyGrowthAgg = await Deposit.aggregate([
      { $match: { createdAt: { $gte: start, $lte: now }, status: { $regex: /^approved$/i } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalGrowth: { $sum: { $ifNull: ["$amount", 0] } },
        },
      },
    ]);

    const weekly = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = d.toISOString().slice(0, 10);
      weekly.push({
        name: d.toLocaleDateString(undefined, { weekday: "short" }),
        date: key,
        profit: weeklyProfitAgg.find((x) => x._id === key)?.totalProfit || 0,
        growth: weeklyGrowthAgg.find((x) => x._id === key)?.totalGrowth || 0,
      });
    }



    // // ---------- 9) Top Clients ----------
    // const topClientsRaw = await User.find({})
    //   .sort({ lifetimeInvestment: -1 })
    //   .limit(9)
    //   .select("name email lifetimeInvestment directRefCount wallets")
    //   .lean();
    // const topClients = topClientsRaw.map((u) => {
    //   const profit = u.wallets?.profit || 0;
    //   const lifetime = u.lifetimeInvestment || 0;
    //   return {
    //     name: u.name || u.email,
    //     roi: lifetime > 0 ? `${Math.round((profit / lifetime) * 100)}%` : "0%",
    //     referrals: u.directRefCount || 0,
    //   };
    // });

    // // ---------- 10) Recent Activities ----------
    // const recentDeposits = await Deposit.find({})
    //   .sort({ createdAt: -1 })
    //   .limit(6)
    //   .select("userId amount status createdAt")
    //   .populate({ path: "userId", select: "name", model: "User" })
    //   .lean();

    // const recentWithdrawals = await Withdrawal.find({})
    //   .sort({ createdAt: -1 })
    //   .limit(6)
    //   .select("userId amountRequested status createdAt")
    //   .populate({ path: "userId", select: "name", model: "User" })
    //   .lean();

    // const activities = [
    //   ...recentDeposits.map((d) => ({
    //     action: `${d.userId?.name || "User"} deposited $${d.amount}`,
    //     time: d.createdAt,
    //   })),
    //   ...recentWithdrawals.map((w) => ({
    //     action: `${w.userId?.name || "User"} withdrawal $${w.amountRequested} (${w.status})`,
    //     time: w.createdAt,
    //   })),
    // ]
    //   .sort((a, b) => new Date(b.time) - new Date(a.time))
    //   .slice(0, 8);

    // ---------- 9) Top Clients ----------
    const topClientsRaw = await User.find({})
      .select("name email lifetimeInvestment directRefCount wallets level")
      .lean();

    // custom sorting logic
    const topClientsSorted = topClientsRaw.sort((a, b) => {
      const investA = a.wallets?.investment || 0;
      const investB = b.wallets?.investment || 0;

      // Primary: Current wallet investment
      if (investB !== investA) {
        return investB - investA;
      }

      // Secondary: Lifetime investment (agar current equal ho)
      return (b.lifetimeInvestment || 0) - (a.lifetimeInvestment || 0);
    });

    const topClients = topClientsSorted.slice(0, 9).map((u) => {
      const profit = u.wallets?.profit || 0;
      const investmentBalance = u.wallets?.investment || 0;
      const lifetime = u.lifetimeInvestment || 0;
      const businessLevel = u.businessLevel || 0;

      return {
        name: u.name || u.email,
        roi: lifetime > 0 ? `${Math.round((profit / lifetime) * 100)}%` : "0%",
        referrals: u.directRefCount || 0,
        investmentBalance,
        businessLevel,
      };
    });

    // ---------- 10) Recent Activities ----------
    const recentDeposits = await Deposit.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .select("userId amount status createdAt")
      .populate({ path: "userId", select: "name", model: "User" })
      .lean();

    const recentWithdrawals = await Withdrawal.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .select("userId amountRequested status createdAt")
      .populate({ path: "userId", select: "name", model: "User" })
      .lean();

    // Wallet Investment Updates (from User model)
    const recentWalletInvestments = await User.find({ "wallets.investment": { $gt: 0 } })
      .sort({ updatedAt: -1 })
      .limit(3)
      .select("name wallets.investment updatedAt")
      .lean();

    // Newly Registered Users
    const recentRegistrations = await User.find({})
      .sort({ createdAt: -1 })
      .limit(3)
      .select("name email createdAt")
      .lean();

    const activities = [
      ...recentDeposits.map((d) => ({
        action: `${d.userId?.name || "User"} deposited $${d.amount}`,
        time: d.createdAt,
      })),
      ...recentWithdrawals.map((w) => ({
        action: `${w.userId?.name || "User"} withdrawal $${w.amountRequested} (${w.status})`,
        time: w.createdAt,
      })),
      ...recentWalletInvestments.map((inv) => ({
        action: `${inv.name || "User"} wallet investment updated to $${inv.wallets.investment}`,
        time: inv.updatedAt,
      })),
      ...recentRegistrations.map((u) => ({
        action: `${u.name || u.email} registered an account`,
        time: u.createdAt,
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 8);

    // New Registers

    const newRegistrationsOnly = await User.find({})
      .sort({ createdAt: -1 })
      .limit(4) // only 2 newest
      .select("name email createdAt")
      .lean()
      .then(users =>
        users.map(u => ({
          action: `${u.name || u.email} registered an account`,
          time: u.createdAt,
        }))
      );

    // ---------- Response ----------
    return res.json({
      totalDeposits,
      activeInvestments,
      withdrawals,
      roiDistributions,
      affiliateTotals,
      affiliateGrowth,
      commissionBreakdown,
      weekly,
      topClients,
      activities,
      newRegistrationsOnly
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    next(err);
  }
};






export const getAdminNotifications = async (req, res) => {
  try {
    const deposits = await Deposit.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .populate("userId", "name email profileImage");

    const withdrawals = await Withdrawal.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .populate("userId", "name email profileImage");

    const registrations = await User.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .select("name email profileImage createdAt");

    const p2pTransactions = await P2PTransaction.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .populate("sender", "name email profileImage")
      .populate("receiver", "name email profileImage");

    const commissionLogs = await Commission.find()
      .sort({ createdAt: -1 })
      .limit(2);

    const activities = [
      ...deposits.map(d => ({
        type: "success",
        title: "New Deposit",
        message: `${d.userId?.name || "Unknown"} deposited $${d.amount}`,
        time: d.createdAt,
        profileImage: d.userId?.profileImage || null
      })),
      ...withdrawals.map(w => ({
        type: "warning",
        title: "Withdrawal Requested",
        message: `${w.userId?.name || "Unknown"} requested $${w.amountRequested} withdrawal`,
        time: w.createdAt,
        profileImage: w.userId?.profileImage || null
      })),
      ...registrations.map(u => ({
        type: "info",
        title: "New Registration",
        message: `${u.name} registered with email ${u.email}`,
        time: u.createdAt,
        profileImage: u.profileImage || null
      })),
      ...p2pTransactions.map(t => ({
        type: "success",
        title: "P2P Transfer",
        message: `${t.sender?.email || "Unknown"} has transferred $${t.amount} to ${t.receiver?.email || "Unknown"} via P2P.`,
        time: t.createdAt,
        profileImage: t.sender?.profileImage || null
      })),
      ...commissionLogs.map(c => ({
        type: "success",
        title: "Commission",
        message: `${c.receiver?.name || "Unknown"} has received a commission of $${c.commission} on an investment of $${c.investment} via Referral.`,
        time: c.date || c.createdAt,
        profileImage: null // Optional: Add if stored elsewhere
      }))
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 10);

    res.json({ notifications: activities });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: err.message
    });
  }
};
