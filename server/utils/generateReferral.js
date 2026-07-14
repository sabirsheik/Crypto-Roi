// import User from "../Models/authuser.js";
// import Investment from "../Models/admin/userInvestment.js";
// import Commission from "../Models/admin/commission.js";
// import dotenv from "dotenv";
// dotenv.config();


// const getReferralTree = async (
//   userId,
//   maxLevel = 12,
//   frontendUrl = process.env.FRONTEND_URL,
//   currentLevel = 1
// ) => {
//   //  Stop recursion if depth exceeded
//   if (currentLevel > maxLevel) return [];

//   //  Fetch all direct referrals (users only)
//   const referrals = await User.find({
//     referrerId: userId,
//     role: "user"
//   }).lean();

//   const result = [];

//   for (const ref of referrals) {
//     // 🔢 Total direct referrals
//     const totalReferrals = await User.countDocuments({
//       referrerId: ref._id,
//       role: "user"
//     });

//     // 💸 Active investment total & plan
//     const userInvestments = await Investment.find({
//       userId: ref._id,
//       status: "active"
//     }).lean();

//     const totalInvestment = userInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);

//     const currentPlan =
//       userInvestments.length > 0
//         ? userInvestments[userInvestments.length - 1].planName
//         : "N/A";

//     // Total affiliate bonus
//     const commissions = await Commission.find({ userId: ref._id }).lean();
//     const affiliateBonusEarned = commissions.reduce((sum, c) => sum + (c.amount || 0), 0);

//     //  MLM eligibility level
//     const userLevel = totalInvestment >= 100 ? 1 : 0;

//     // 🔁 Recursively build tree (child referrals)
//     const subTree = await getReferralTree(
//       ref._id,
//       maxLevel,
//       frontendUrl,
//       currentLevel + 1
//     );

//     result.push({
//       _id: ref._id,
//       name: ref.name,
//       email: ref.email,
//       referralCode: ref.referralCode,
//       referralLink: `${frontendUrl}/register?ref=${ref.referralCode}`,
//       sponsorId: userId,
//       level: userLevel,
//       role: ref.role,
//       businessLevel: ref.businessLevel || 1,
//       createdAt: ref.createdAt,
//       totalReferrals,
//       totalInvestment,
//       currentPlan,
//       affiliateBonusEarned,
//       wallets: ref.wallets || {
//         investment: 0,
//         main: 0,
//         profit: 0,
//         split: 0,
//         cashbox: 0,
//         affiliate: 0
//       },
//       referrals: subTree
//     });
//   }

//   return result;
// };

// export default getReferralTree;



import User from "../Models/authuser.js";
import Investment from "../Models/admin/userInvestment.js";
import Commission from "../Models/admin/commission.js";

const getReferralTree = async (
  userId,
  maxLevel = 12,
  frontendUrl,
  currentLevel = 1
) => {
  if (currentLevel > maxLevel) return [];

  // ✅ fetch only direct referrals (users)
  const referrals = await User.find({ referrerId: userId, role: "user" }).lean();

  const result = [];
  for (const ref of referrals) {
    // total direct referrals
    const totalReferrals = await User.countDocuments({ referrerId: ref._id, role: "user" });

    // active investment
    const userInvestments = await Investment.find({ userId: ref._id, status: "active" }).lean();
    const totalInvestment = userInvestments.reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const currentPlan =
      userInvestments.length > 0
        ? userInvestments[userInvestments.length - 1].planName
        : "N/A";

    // total commissions
    const commissions = await Commission.find({ userId: ref._id }).lean();
    const affiliateBonusEarned = commissions.reduce((sum, c) => sum + (c.amount || 0), 0);

    // MLM eligibility
    const userLevel = totalInvestment >= 100 ? 1 : 0;

    // recursive children
    const subTree = await getReferralTree(
      ref._id,
      maxLevel,
      frontendUrl,
      currentLevel + 1
    );

    result.push({
      _id: ref._id,
      name: ref.name,
      email: ref.email,
      referralCode: ref.referralCode,
      referralLink: `${frontendUrl}/register?ref=${ref.referralCode}`,
      sponsorId: userId, // 👈 always its parent
      level: userLevel,
      role: ref.role,
      businessLevel: ref.businessLevel || 1,
      createdAt: ref.createdAt,
      totalReferrals,
      totalInvestment,
      currentPlan,
      affiliateBonusEarned,
      wallets: ref.wallets || {
        investment: 0,
        main: 0,
        profit: 0,
        split: 0,
        cashbox: 0,
        affiliate: 0,
      },
      referrals: subTree,
    });
  }

  return result;
};

export default getReferralTree;
