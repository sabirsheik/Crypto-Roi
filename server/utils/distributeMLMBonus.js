// // distributeMLMBonus.js
// // Implements hierarchical MLM with per-level (depth) business,
// // Level-1 unlock rule (3 directs + depth-1 >= $100 AND those 3 are active),
// // dynamic lock/unlock & relock cascade,
// // up to 12-level commission distribution,
// // and user document updates (teamBusiness map, businessLevel,
// // userStatus, affiliate wallet, lifetimeAffiliateEarnings).
// // ------------------------------------------------------------

// import mongoose from "mongoose";
// import User from "../Models/authuser.js";
// import Commission from "../Models/admin/commission.js";

// /**
//  * Commission % for each MLM level (index 0 => level 1)
//  * You can change values without touching logic below.
//  */
// const MLM_COMMISSIONS = [8, 3, 2, 1, 1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5];

// /**
//  * LEVEL_REQUIREMENTS: active team business required at each depth level
//  * Index 0 => requirement for Level 1, etc.
//  * NOTE: These are per-depth (not cumulative) requirements.
//  */
// const LEVEL_REQUIREMENTS = [
//   100,    // Level 1: SPECIAL rule with directs also applies (see logic)
//   200,    // Level 2
//   400,    // Level 3
//   800,    // Level 4
//   1600,   // Level 5
//   3200,   // Level 6
//   6400,   // Level 7
//   12800,  // Level 8
//   25600,  // Level 9
//   51200,  // Level 10
//   102400, // Level 11
//   204800  // Level 12
// ];

// /**
//  * Compute user's personal level from their own active investment.
//  * (Independent of the team; purely based on wallets.investment.)
//  */
// function computePersonalLevelFromInvestment(investment) {
//   investment = Number(investment || 0);
//   let level = 0;
//   for (let i = 0; i < LEVEL_REQUIREMENTS.length; i++) {
//     if (investment >= LEVEL_REQUIREMENTS[i]) level = i + 1;
//     else break;
//   }
//   return level;
// }

// /**
//  * Fetch direct referrals of a user (depth=1).
//  */
// async function getDirects(userId) {
//   return User.find(
//     { referrerId: userId },
//     { _id: 1, name: 1, email: 1, "wallets.investment": 1 }
//   ).lean();
// }

// /**
//  * BFS to compute:
//  *  - levelBusiness: { 1: sum of depth-1 active investments, 2: sum of depth-2, ... }
//  *  - totals: totalPartners (all downline count), totalActivePartners, totalTeamBusiness (sum across all levels)
//  *  - branchBusiness: per-direct branch sum (depth >=1 below each direct)
//  *
//  * maxDepth typically = 12.
//  */
// async function computeTeamBusinessByDepth(userId, maxDepth = LEVEL_REQUIREMENTS.length) {
//   const levelBusiness = {}; // depth -> sum
//   let totalPartners = 0;
//   let totalActivePartners = 0;
//   let totalTeamBusiness = 0;

//   // For the "Directs" box
//   const directs = await getDirects(userId);
//   const directIds = directs.map(d => String(d._id));

//   // Initialize per-direct branch business accumulator
//   const branchBusiness = {}; // directId -> sum across its entire subtree
//   for (const dId of directIds) branchBusiness[dId] = 0;

//   // BFS
//   let depth = 1;
//   let currentIds = [userId];

//   while (depth <= maxDepth) {
//     // Get children of all nodes at previous frontier
//     const children = await User.find(
//       { referrerId: { $in: currentIds } },
//       { _id: 1, referrerId: 1, "wallets.investment": 1 }
//     ).lean();

//     if (!children.length) break;

//     // Track next frontier
//     const nextIds = [];

//     // At this depth, sum active investments
//     let depthSum = 0;

//     for (const child of children) {
//       const activeInv = Number(child?.wallets?.investment || 0);
//       depthSum += activeInv;
//       totalTeamBusiness += activeInv;
//       totalPartners += 1;
//       if (activeInv > 0) totalActivePartners += 1;

//       // Attribute to branchBusiness for the correct top-level direct
//       if (depth === 1) {
//         const dId = String(child._id);
//         if (branchBusiness[dId] == null) branchBusiness[dId] = 0;
//         branchBusiness[dId] += activeInv;
//       }
//       nextIds.push(child._id);
//     }

//     // Persist levelBusiness for this depth
//     levelBusiness[depth] = Number(depthSum.toFixed(8));

//     currentIds = nextIds;
//     depth += 1;
//   }

//   // Second pass: compute per-direct branch sums accurately with lineage mapping
//   // Reset to avoid double counting (we already touched depth-1 during BFS).
//   if (directIds.length) {
//     for (const dId of directIds) branchBusiness[dId] = 0;
//     for (const dId of directIds) {
//       let frontier = [dId];
//       while (frontier.length) {
//         const kids = await User.find(
//           { referrerId: { $in: frontier } },
//           { _id: 1, "wallets.investment": 1 }
//         ).lean();
//         if (!kids.length) break;
//         let next = [];
//         for (const k of kids) {
//           const inv = Number(k?.wallets?.investment || 0);
//           branchBusiness[dId] += inv;
//           next.push(k._id);
//         }
//         frontier = next;
//       }
//     }
//   }

//   return {
//     levelBusiness,
//     totalPartners,
//     totalActivePartners,
//     totalTeamBusiness,
//     branchBusiness,   // per direct subtree totals (excludes the direct’s own investment)
//     directs           // [{_id,name,email,wallets.investment}]
//   };
// }

// /**
//  * Compute the highest team-unlocked level using your UPDATED rules.
//  */
// async function computeTeamUnlockedLevels(userId) {
//   const {
//     levelBusiness,
//     totalPartners,
//     totalActivePartners,
//     totalTeamBusiness,
//     branchBusiness,
//     directs
//   } = await computeTeamBusinessByDepth(userId, LEVEL_REQUIREMENTS.length);

//   // Pre-calc directs stats for Level 1 rule
//   const directsCount = directs.length;
//   const directsSum = directs.reduce((acc, d) => acc + Number(d?.wallets?.investment || 0), 0);

//   // NEW: "active direct" = wallets.investment > 0
//   const activeDirectsCount = directs.filter(d => Number(d?.wallets?.investment || 0) > 0).length;

//   const levelStatus = {};

//   // L1: compute criteria but report unlocked = true in levelStatus (UI)
//   const requiredL1 = LEVEL_REQUIREMENTS[0];
//   const activeL1 = Number(levelBusiness[1] || 0); // depth-1 active business
//   const has3Directs = directsCount >= 3;
//   const threeDirectsActive = activeDirectsCount >= 3;
//   const depthHas100 = activeL1 >= requiredL1;

//   const criteriaMetForL1 = has3Directs && threeDirectsActive && depthHas100;

//   levelStatus[1] = {
//     required: requiredL1,
//     active: activeL1,
//     unlocked: true,
//     criteriaMet: criteriaMetForL1,
//     stats: {
//       directsCount,
//       activeDirectsCount,
//       directsSum
//     }
//   };

//   if (!criteriaMetForL1) {
//     for (let i = 1; i < LEVEL_REQUIREMENTS.length; i++) {
//       const lvl = i + 1;
//       levelStatus[lvl] = {
//         required: LEVEL_REQUIREMENTS[i],
//         active: Number(levelBusiness[lvl] || 0),
//         unlocked: false
//       };
//     }

//     return {
//       highest: 0,
//       levelStatus,
//       levelBusiness,
//       totalPartners,
//       totalActivePartners,
//       totalTeamBusiness,
//       branchBusiness,
//       directs,
//       directsCount,
//       directsSum,
//       activeDirectsCount,
//       criteriaMetForL1
//     };
//   }

//   // New progression: L1 criteria met => L2 unlocked directly
//   let highest = 2;
//   levelStatus[2] = {
//     required: LEVEL_REQUIREMENTS[1],
//     active: Number(levelBusiness[2] || 0),
//     unlocked: true
//   };

//   for (let levelNum = 3; levelNum <= LEVEL_REQUIREMENTS.length; levelNum++) {
//     const prevDepth = levelNum - 1;
//     const prevReqIdx = levelNum - 2;
//     const prevRequired = LEVEL_REQUIREMENTS[prevReqIdx];
//     const prevActive = Number(levelBusiness[prevDepth] || 0);

//     const prevCriteriaMet = prevActive >= prevRequired;
//     const unlocked = prevCriteriaMet;

//     const thisReqIdx = levelNum - 1;
//     levelStatus[levelNum] = {
//       required: LEVEL_REQUIREMENTS[thisReqIdx],
//       active: Number(levelBusiness[levelNum] || 0),
//       unlocked
//     };

//     if (!unlocked) break;
//     highest = levelNum;
//   }

//   return {
//     highest,
//     levelStatus,
//     levelBusiness,
//     totalPartners,
//     totalActivePartners,
//     totalTeamBusiness,
//     branchBusiness,
//     directs,
//     directsCount,
//     directsSum,
//     activeDirectsCount,
//     criteriaMetForL1
//   };
// }

// /**
//  * Convenience: updates a user's cached MLM stats on the user doc
//  */
// async function upsertUserMlmCache(userId, teamUnlockedLevel, levelBusiness) {
//   const mapObj = {};
//   Object.entries(levelBusiness || {}).forEach(([k, v]) => {
//     mapObj[k] = Number(v || 0);
//   });

//   // ✅ Fix: allow real 0 (locked), don’t force minimum 1
//   const businessLevelForCache = Number(teamUnlockedLevel || 0);

//   await User.updateOne(
//     { _id: userId },
//     {
//       $set: {
//         teamBusiness: mapObj,
//         businessLevel: businessLevelForCache,
//         userStatus: businessLevelForCache > 0 ? "active" : "inactive"
//       }
//     }
//   );
// }

// /**
//  * Main: distributeMLMBonus
//  */
// const distributeMLMBonus = async (registeredUser, investmentDelta = 0, opts = {}) => {
//   const emit = typeof opts.emit === "function" ? opts.emit : null;

//   if (!registeredUser || !registeredUser._id) throw new Error("Invalid registered user passed.");
//   const depositAmount = Number(investmentDelta || 0);

//   const triggeringUser = await User.findById(registeredUser._id)
//     .select("_id name email referrerId wallets.investment")
//     .lean();
//   if (!triggeringUser) throw new Error("Triggering user not found in DB.");

//   const results = [];

//   let referrerId = triggeringUser.referrerId;
//   let levelIndex = 0;

//   while (referrerId && levelIndex < MLM_COMMISSIONS.length) {
//     const thisLevelNumber = levelIndex + 1;
//     const percent = Number(MLM_COMMISSIONS[levelIndex] ?? 0);

//     const referrer = await User.findById(referrerId)
//       .select("_id name email referrerId wallets.investment")
//       .lean();
//     if (!referrer) break;

//     const referrerPersonalLevel = computePersonalLevelFromInvestment(referrer?.wallets?.investment || 0);

//     const {
//       highest: referrerTeamUnlockedLevelReal,
//       levelStatus,
//       levelBusiness,
//       totalPartners,
//       totalActivePartners,
//       totalTeamBusiness,
//       branchBusiness,
//       directs,
//       directsCount,
//       directsSum,
//       activeDirectsCount,
//       criteriaMetForL1
//     } = await computeTeamUnlockedLevels(referrer._id);

//     const effectiveLevel = Math.min(referrerPersonalLevel, referrerTeamUnlockedLevelReal);

//     const commissionAmount = Number(((depositAmount * percent) / 100).toFixed(8));

//     // ✅ Fix: only unlocked levels get commission + history
//     const eligible =
//       commissionAmount > 0 &&
//       (thisLevelNumber === 1 ? true : thisLevelNumber <= effectiveLevel);

//     const commissionDoc = {
//       receiver: {
//         id: referrer._id,
//         name: referrer.name || "Unknown",
//         email: referrer.email || "unknown@example.com"
//       },
//       referralUser: {
//         id: triggeringUser._id,
//         name: triggeringUser.name || "Unknown",
//         email: triggeringUser.email || "unknown@example.com"
//       },
//       level: thisLevelNumber,
//       commission: commissionAmount,
//       plan: {
//         title: opts.plan?.title || "Default Plan",
//         roi: opts.plan?.roi || 0
//       },
//       investment: depositAmount,
//       date: new Date(),
//       status: eligible ? "paid" : "pending",
//       meta: {
//         personalLevel: referrerPersonalLevel,
//         teamUnlockedLevel: referrerTeamUnlockedLevelReal,
//         effectiveLevel,
//         levelStatus,
//         levelBusinessSnapshot: levelBusiness,
//         totals: {
//           totalPartners,
//           totalActivePartners,
//           totalTeamBusiness
//         },
//         directsSummary: {
//           count: directsCount,
//           activeCount: activeDirectsCount,
//           sum: directsSum,
//           list: directs.map(d => ({
//             id: String(d._id),
//             name: d.name || "Unknown",
//             email: d.email || "",
//             activeInvestment: Number(d?.wallets?.investment || 0),
//             branchBusiness: Number(branchBusiness[String(d._id)] || 0)
//           }))
//         },
//         criteriaMetForL1
//       }
//     };

//     const session = await mongoose.startSession();
//     let updatedReferrerDoc = null;
//     try {
//       session.startTransaction();

//       const businessLevelForCache = Number(effectiveLevel || 0); // ✅ Fix applied here
//       await User.updateOne(
//         { _id: referrer._id },
//         {
//           $set: {
//             teamBusiness: levelBusiness,
//             businessLevel: businessLevelForCache,
//             userStatus: businessLevelForCache > 0 ? "active" : "inactive"
//           }
//         },
//         { session }
//       );

//       if (eligible) {
//         updatedReferrerDoc = await User.findOneAndUpdate(
//           { _id: referrer._id },
//           {
//             $inc: {
//               "wallets.affiliate": commissionAmount,
//               lifetimeAffiliateEarnings: commissionAmount
//             }
//           },
//           { session, new: true, select: "wallets.affiliate lifetimeAffiliateEarnings" }
//         );

//         if (!updatedReferrerDoc) {
//           await session.abortTransaction();
//           session.endSession();
//           throw new Error(`[MLM][ERROR] Wallet credit failed for referrer ${referrer._id}`);
//         }
//       }

//       if (eligible) {
//         await Commission.create([commissionDoc], { session });
//       }

//       await session.commitTransaction();
//       session.endSession();

//       if (emit && eligible) {
//         try {
//           emit("mlm:commission", {
//             to: String(referrer._id),
//             level: thisLevelNumber,
//             commission: commissionAmount,
//             status: commissionDoc.status,
//             businessLevel: effectiveLevel,
//             totals: {
//               totalPartners,
//               totalActivePartners,
//               totalTeamBusiness
//             },
//             levelStatus,
//             directs: commissionDoc.meta.directsSummary.list
//           });
//         } catch (e) {
//           console.warn("Emit failed:", e);
//         }
//       }

//       results.push({
//         referrerId: referrer._id,
//         level: thisLevelNumber,
//         paid: eligible,
//         commissionAmount,
//         paidBalance: updatedReferrerDoc ? (updatedReferrerDoc.wallets?.affiliate ?? null) : null,
//         businessLevelUpdatedTo: effectiveLevel,
//         totals: {
//           totalPartners,
//           totalActivePartners,
//           totalTeamBusiness
//         }
//       });
//     } catch (err) {
//       try { await session.abortTransaction(); } catch (e) {}
//       try { session.endSession(); } catch (e) {}
//       console.error("[MLM] transaction error:", err);
//       throw err;
//     }

//     referrerId = referrer.referrerId;
//     levelIndex++;
//   }

//   try {
//     const {
//       highest: trigTeamUnlocked,
//       levelBusiness: trigLevelBusiness
//     } = await computeTeamUnlockedLevels(triggeringUser._id);
//     const trigPersonal = computePersonalLevelFromInvestment(triggeringUser?.wallets?.investment || 0);
//     const trigEffective = Math.min(trigPersonal, trigTeamUnlocked);
//     await upsertUserMlmCache(triggeringUser._id, trigEffective, trigLevelBusiness);
//   } catch (e) {
//     console.warn("Failed to refresh triggering user's MLM cache:", e?.message);
//   }

//   console.log("MLM distribution complete. records:", results.length);
//   return results;
// };
// export default distributeMLMBonus;





// ///////////////////////////////////////////
/////////////////////////////



// // distributeMLMBonus.js
// // Implements hierarchical MLM with per-level (depth) business,
// // Level-1 unlock rule (3 directs + depth-1 >= $100 AND those 3 are active),
// // dynamic lock/unlock & relock cascade,
// // up to 12-level commission distribution,
// // and user document updates (teamBusiness map, businessLevel,
// // userStatus, affiliate wallet, lifetimeAffiliateEarnings).
// // ------------------------------------------------------------

// import mongoose from "mongoose";
// import User from "../Models/authuser.js";
// import Commission from "../Models/admin/commission.js";

// /**
//  * Commission % for each MLM level (index 0 => level 1)
//  * You can change values without touching logic below.
//  */
// const MLM_COMMISSIONS = [8, 3, 2, 1, 1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5];

// /**
//  * LEVEL_REQUIREMENTS: active team business required at each depth level
//  * Index 0 => requirement for Level 1, etc.
//  * NOTE: These are per-depth (not cumulative) requirements.
//  */
// const LEVEL_REQUIREMENTS = [
//   100,    // Level 1: SPECIAL rule with directs also applies (see logic)
//   200,    // Level 2
//   400,    // Level 3
//   800,    // Level 4
//   1600,   // Level 5
//   3200,   // Level 6
//   6400,   // Level 7
//   12800,  // Level 8
//   25600,  // Level 9
//   51200,  // Level 10
//   102400, // Level 11
//   204800  // Level 12
// ];

// /**
//  * Compute user's personal level from their own active investment.
//  * (Independent of the team; purely based on wallets.investment.)
//  */
// function computePersonalLevelFromInvestment(investment) {
//   investment = Number(investment || 0);
//   let level = 0;
//   for (let i = 0; i < LEVEL_REQUIREMENTS.length; i++) {
//     if (investment >= LEVEL_REQUIREMENTS[i]) level = i + 1;
//     else break;
//   }
//   return level;
// }

// /**
//  * Fetch direct referrals of a user (depth=1).
//  */
// async function getDirects(userId) {
//   return User.find(
//     { referrerId: userId },
//     { _id: 1, name: 1, email: 1, "wallets.investment": 1 }
//   ).lean();
// }

// /**
//  * BFS to compute:
//  *  - levelBusiness: { 1: sum of depth-1 active investments, 2: sum of depth-2, ... }
//  *  - totals: totalPartners (all downline count), totalActivePartners, totalTeamBusiness (sum across all levels)
//  *  - branchBusiness: per-direct branch sum (depth >=1 below each direct)
//  *
//  * maxDepth typically = 12.
//  */
// async function computeTeamBusinessByDepth(userId, maxDepth = LEVEL_REQUIREMENTS.length) {
//   const levelBusiness = {}; // depth -> sum
//   let totalPartners = 0;
//   let totalActivePartners = 0;
//   let totalTeamBusiness = 0;

//   // For the "Directs" box
//   const directs = await getDirects(userId);
//   const directIds = directs.map(d => String(d._id));

//   // Initialize per-direct branch business accumulator
//   const branchBusiness = {}; // directId -> sum across its entire subtree
//   for (const dId of directIds) branchBusiness[dId] = 0;

//   // BFS
//   let depth = 1;
//   let currentIds = [userId];

//   while (depth <= maxDepth) {
//     // Get children of all nodes at previous frontier
//     const children = await User.find(
//       { referrerId: { $in: currentIds } },
//       { _id: 1, referrerId: 1, "wallets.investment": 1 }
//     ).lean();

//     if (!children.length) break;

//     // Track next frontier
//     const nextIds = [];

//     // At this depth, sum active investments
//     let depthSum = 0;

//     for (const child of children) {
//       const activeInv = Number(child?.wallets?.investment || 0);
//       depthSum += activeInv;
//       totalTeamBusiness += activeInv;
//       totalPartners += 1;
//       if (activeInv > 0) totalActivePartners += 1;

//       // Attribute to branchBusiness for the correct top-level direct
//       if (depth === 1) {
//         const dId = String(child._id);
//         if (branchBusiness[dId] == null) branchBusiness[dId] = 0;
//         branchBusiness[dId] += activeInv;
//       }
//       nextIds.push(child._id);
//     }

//     // Persist levelBusiness for this depth
//     levelBusiness[depth] = Number(depthSum.toFixed(8));

//     currentIds = nextIds;
//     depth += 1;
//   }

//   // Second pass: compute per-direct branch sums accurately with lineage mapping
//   // Reset to avoid double counting (we already touched depth-1 during BFS).
//   if (directIds.length) {
//     for (const dId of directIds) branchBusiness[dId] = 0;
//     for (const dId of directIds) {
//       let frontier = [dId];
//       while (frontier.length) {
//         const kids = await User.find(
//           { referrerId: { $in: frontier } },
//           { _id: 1, "wallets.investment": 1 }
//         ).lean();
//         if (!kids.length) break;
//         let next = [];
//         for (const k of kids) {
//           const inv = Number(k?.wallets?.investment || 0);
//           branchBusiness[dId] += inv;
//           next.push(k._id);
//         }
//         frontier = next;
//       }
//     }
//   }

//   return {
//     levelBusiness,
//     totalPartners,
//     totalActivePartners,
//     totalTeamBusiness,
//     branchBusiness,   // per direct subtree totals (excludes the direct’s own investment)
//     directs           // [{_id,name,email,wallets.investment}]
//   };
// }

// /**
//  * Compute the highest team-unlocked level using your UPDATED rules.
//  */
// async function computeTeamUnlockedLevels(userId) {
//   const {
//     levelBusiness,
//     totalPartners,
//     totalActivePartners,
//     totalTeamBusiness,
//     branchBusiness,
//     directs
//   } = await computeTeamBusinessByDepth(userId, LEVEL_REQUIREMENTS.length);

//   // Pre-calc directs stats for Level 1 rule
//   const directsCount = directs.length;
//   const directsSum = directs.reduce((acc, d) => acc + Number(d?.wallets?.investment || 0), 0);

//   // NEW: "active direct" = wallets.investment > 0
//   const activeDirectsCount = directs.filter(d => Number(d?.wallets?.investment || 0) > 0).length;

//   const levelStatus = {};

//   // L1: compute criteria but report unlocked = true in levelStatus (UI)
//   const requiredL1 = LEVEL_REQUIREMENTS[0];
//   const activeL1 = Number(levelBusiness[1] || 0); // depth-1 active business
//   const has3Directs = directsCount >= 3;
//   const threeDirectsActive = activeDirectsCount >= 3;
//   const depthHas100 = activeL1 >= requiredL1;

//   const criteriaMetForL1 = has3Directs && threeDirectsActive && depthHas100;

//   levelStatus[1] = {
//     required: requiredL1,
//     active: activeL1,
//     unlocked: true,
//     criteriaMet: criteriaMetForL1,
//     stats: {
//       directsCount,
//       activeDirectsCount,
//       directsSum
//     }
//   };

//   if (!criteriaMetForL1) {
//     for (let i = 1; i < LEVEL_REQUIREMENTS.length; i++) {
//       const lvl = i + 1;
//       levelStatus[lvl] = {
//         required: LEVEL_REQUIREMENTS[i],
//         active: Number(levelBusiness[lvl] || 0),
//         unlocked: false
//       };
//     }

//     return {
//       highest: 0,
//       levelStatus,
//       levelBusiness,
//       totalPartners,
//       totalActivePartners,
//       totalTeamBusiness,
//       branchBusiness,
//       directs,
//       directsCount,
//       directsSum,
//       activeDirectsCount,
//       criteriaMetForL1
//     };
//   }

//   // New progression: L1 criteria met => L2 unlocked directly
//   let highest = 2;
//   levelStatus[2] = {
//     required: LEVEL_REQUIREMENTS[1],
//     active: Number(levelBusiness[2] || 0),
//     unlocked: true
//   };

//   for (let levelNum = 3; levelNum <= LEVEL_REQUIREMENTS.length; levelNum++) {
//     const prevDepth = levelNum - 1;
//     const prevReqIdx = levelNum - 2;
//     const prevRequired = LEVEL_REQUIREMENTS[prevReqIdx];
//     const prevActive = Number(levelBusiness[prevDepth] || 0);

//     const prevCriteriaMet = prevActive >= prevRequired;
//     const unlocked = prevCriteriaMet;

//     const thisReqIdx = levelNum - 1;
//     levelStatus[levelNum] = {
//       required: LEVEL_REQUIREMENTS[thisReqIdx],
//       active: Number(levelBusiness[levelNum] || 0),
//       unlocked
//     };

//     if (!unlocked) break;
//     highest = levelNum;
//   }

//   return {
//     highest,
//     levelStatus,
//     levelBusiness,
//     totalPartners,
//     totalActivePartners,
//     totalTeamBusiness,
//     branchBusiness,
//     directs,
//     directsCount,
//     directsSum,
//     activeDirectsCount,
//     criteriaMetForL1
//   };
// }

// /**
//  * Convenience: updates a user's cached MLM stats on the user doc
//  */
// async function upsertUserMlmCache(userId, teamUnlockedLevel, levelBusiness) {
//   const mapObj = {};
//   Object.entries(levelBusiness || {}).forEach(([k, v]) => {
//     mapObj[k] = Number(v || 0);
//   });

//   // allow real 0 (locked), don’t force minimum 1
//   const businessLevelForCache = Number(teamUnlockedLevel || 0);

//   await User.updateOne(
//     { _id: userId },
//     {
//       $set: {
//         teamBusiness: mapObj,
//         businessLevel: businessLevelForCache,
//         userStatus: businessLevelForCache > 0 ? "active" : "inactive"
//       }
//     }
//   );
// }

// /**
//  * Main: distributeMLMBonus
//  */
// const distributeMLMBonus = async (registeredUser, investmentDelta = 0, opts = {}) => {
//   const emit = typeof opts.emit === "function" ? opts.emit : null;

//   if (!registeredUser || !registeredUser._id) throw new Error("Invalid registered user passed.");
//   const depositAmount = Number(investmentDelta || 0);

//   const triggeringUser = await User.findById(registeredUser._id)
//     .select("_id name email referrerId wallets.investment")
//     .lean();
//   if (!triggeringUser) throw new Error("Triggering user not found in DB.");

//   const results = [];

//   let referrerId = triggeringUser.referrerId;
//   let levelIndex = 0;

//   while (referrerId && levelIndex < MLM_COMMISSIONS.length) {
//     const thisLevelNumber = levelIndex + 1;
//     const percent = Number(MLM_COMMISSIONS[levelIndex] ?? 0);

//     const referrer = await User.findById(referrerId)
//       .select("_id name email referrerId wallets.investment")
//       .lean();
//     if (!referrer) break;

//     const referrerPersonalLevel = computePersonalLevelFromInvestment(referrer?.wallets?.investment || 0);

//     const {
//       highest: referrerTeamUnlockedLevelReal,
//       levelStatus,
//       levelBusiness,
//       totalPartners,
//       totalActivePartners,
//       totalTeamBusiness,
//       branchBusiness,
//       directs,
//       directsCount,
//       directsSum,
//       activeDirectsCount,
//       criteriaMetForL1
//     } = await computeTeamUnlockedLevels(referrer._id);

//     // Effective level: min(personal, team)
//     const effectiveLevel = Math.min(referrerPersonalLevel, referrerTeamUnlockedLevelReal);

//     const commissionAmount = Number(((depositAmount * percent) / 100).toFixed(8));

//     // 🚫 If this level is locked (for levels > 1), stop the chain immediately
//     if (thisLevelNumber > 1 && thisLevelNumber > effectiveLevel) {
//       break;
//     }

//     // ✅ If we reached here: either Level-1 (always) OR unlocked level
//     const eligible = commissionAmount > 0;

//     const session = await mongoose.startSession();
//     let updatedReferrerDoc = null;
//     try {
//       session.startTransaction();

//       const businessLevelForCache = Number(effectiveLevel || 0);
//       await User.updateOne(
//         { _id: referrer._id },
//         {
//           $set: {
//             teamBusiness: levelBusiness,
//             businessLevel: businessLevelForCache,
//             userStatus: businessLevelForCache > 0 ? "active" : "inactive"
//           }
//         },
//         { session }
//       );

//       if (eligible) {
//         // credit wallet
//         updatedReferrerDoc = await User.findOneAndUpdate(
//           { _id: referrer._id },
//           {
//             $inc: {
//               "wallets.affiliate": commissionAmount,
//               lifetimeAffiliateEarnings: commissionAmount
//             }
//           },
//           { session, new: true, select: "wallets.affiliate lifetimeAffiliateEarnings" }
//         );

//         if (!updatedReferrerDoc) {
//           await session.abortTransaction();
//           session.endSession();
//           throw new Error(`[MLM][ERROR] Wallet credit failed for referrer ${referrer._id}`);
//         }

//         // commission record (only when eligible)
//         const commissionDoc = {
//           receiver: {
//             id: referrer._id,
//             name: referrer.name || "Unknown",
//             email: referrer.email || "unknown@example.com"
//           },
//           referralUser: {
//             id: triggeringUser._id,
//             name: triggeringUser.name || "Unknown",
//             email: triggeringUser.email || "unknown@example.com"
//           },
//           level: thisLevelNumber,
//           commission: commissionAmount,
//           plan: {
//             title: opts.plan?.title || "Default Plan",
//             roi: opts.plan?.roi || 0
//           },
//           investment: depositAmount,
//           date: new Date(),
//           status: "paid",
//           meta: {
//             personalLevel: referrerPersonalLevel,
//             teamUnlockedLevel: referrerTeamUnlockedLevelReal,
//             effectiveLevel,
//             levelStatus,
//             levelBusinessSnapshot: levelBusiness,
//             totals: {
//               totalPartners,
//               totalActivePartners,
//               totalTeamBusiness
//             },
//             directsSummary: {
//               count: directsCount,
//               activeCount: activeDirectsCount,
//               sum: directsSum,
//               list: directs.map(d => ({
//                 id: String(d._id),
//                 name: d.name || "Unknown",
//                 email: d.email || "",
//                 activeInvestment: Number(d?.wallets?.investment || 0),
//                 branchBusiness: Number(branchBusiness[String(d._id)] || 0)
//               }))
//             },
//             criteriaMetForL1
//           }
//         };

//         await Commission.create([commissionDoc], { session });
//       }

//       await session.commitTransaction();
//       session.endSession();

//       if (emit && eligible) {
//         try {
//           emit("mlm:commission", {
//             to: String(referrer._id),
//             level: thisLevelNumber,
//             commission: commissionAmount,
//             status: "paid",
//             businessLevel: effectiveLevel,
//             totals: {
//               totalPartners,
//               totalActivePartners,
//               totalTeamBusiness
//             },
//             levelStatus,
//             directs: directs.map(d => ({
//               id: String(d._id),
//               name: d.name || "Unknown",
//               email: d.email || "",
//               activeInvestment: Number(d?.wallets?.investment || 0),
//               branchBusiness: Number(branchBusiness[String(d._id)] || 0)
//             }))
//           });
//         } catch (e) {
//           console.warn("Emit failed:", e);
//         }
//       }

//       if (eligible) {
//         results.push({
//           referrerId: referrer._id,
//           level: thisLevelNumber,
//           paid: true,
//           commissionAmount,
//           paidBalance: updatedReferrerDoc ? (updatedReferrerDoc.wallets?.affiliate ?? null) : null,
//           businessLevelUpdatedTo: effectiveLevel,
//           totals: {
//             totalPartners,
//             totalActivePartners,
//             totalTeamBusiness
//           }
//         });
//       }
//     } catch (err) {
//       try { await session.abortTransaction(); } catch (e) {}
//       try { session.endSession(); } catch (e) {}
//       console.error("[MLM] transaction error:", err);
//       throw err;
//     }

//     // Move up the chain
//     referrerId = referrer.referrerId;
//     levelIndex++;
//   }

//   // Refresh triggering user's own cached team stats (dashboard)
//   try {
//     const {
//       highest: trigTeamUnlocked,
//       levelBusiness: trigLevelBusiness
//     } = await computeTeamUnlockedLevels(triggeringUser._id);
//     const trigPersonal = computePersonalLevelFromInvestment(triggeringUser?.wallets?.investment || 0);
//     const trigEffective = Math.min(trigPersonal, trigTeamUnlocked);
//     await upsertUserMlmCache(triggeringUser._id, trigEffective, trigLevelBusiness);
//   } catch (e) {
//     console.warn("Failed to refresh triggering user's MLM cache:", e?.message);
//   }

//   console.log("MLM distribution complete. records:", results.length);
//   return results;
// };
// export default distributeMLMBonus;










































// distributeMLMBonus.js
// Implements hierarchical MLM with per-level (depth) business,
// Level-1 unlock rule (3 directs + depth-1 >= $100 AND those 3 are active),
// dynamic lock/unlock & relock cascade,
// up to 12-level commission distribution,
// and user document updates (teamBusiness map, businessLevel,
// userStatus, affiliate wallet, lifetimeAffiliateEarnings).
// ------------------------------------------------------------

// import mongoose from "mongoose";
// import User from "../Models/authuser.js";
// import Commission from "../Models/admin/commission.js";

// /**
//  * Commission % for each MLM level (index 0 => level 1)
//  */
// const MLM_COMMISSIONS = [8, 3, 2, 1, 1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5];

// /**
//  * LEVEL_REQUIREMENTS: active team business required at each depth level
//  * (per-depth, not cumulative)
//  */
// const LEVEL_REQUIREMENTS = [
//   100,    // Level 1 (special rule with 3 active directs)
//   200,    // Level 2
//   400,    // Level 3
//   800,    // Level 4
//   1600,   // Level 5
//   3200,   // Level 6
//   6400,   // Level 7
//   12800,  // Level 8
//   25600,  // Level 9
//   51200,  // Level 10
//   102400, // Level 11
//   204800  // Level 12
// ];

// /**
//  * Personal level from user's own active investment.
//  * (Kept for meta/debug; NOT used to cap commission anymore.)
//  */
// function computePersonalLevelFromInvestment(investment) {
//   investment = Number(investment || 0);
//   let level = 0;
//   for (let i = 0; i < LEVEL_REQUIREMENTS.length; i++) {
//     if (investment >= LEVEL_REQUIREMENTS[i]) level = i + 1;
//     else break;
//   }
//   return level;
// }

// /** Fetch direct referrals (depth=1). */
// async function getDirects(userId) {
//   return User.find(
//     { referrerId: userId },
//     { _id: 1, name: 1, email: 1, "wallets.investment": 1 }
//   ).lean();
// }

// /**
//  * BFS: compute level-wise team business and per-direct branch sums
//  */
// async function computeTeamBusinessByDepth(userId, maxDepth = LEVEL_REQUIREMENTS.length) {
//   const levelBusiness = {}; // depth -> sum
//   let totalPartners = 0;
//   let totalActivePartners = 0;
//   let totalTeamBusiness = 0;

//   const directs = await getDirects(userId);
//   const directIds = directs.map(d => String(d._id));

//   const branchBusiness = {};
//   for (const dId of directIds) branchBusiness[dId] = 0;

//   let depth = 1;
//   let currentIds = [userId];

//   while (depth <= maxDepth) {
//     const children = await User.find(
//       { referrerId: { $in: currentIds } },
//       { _id: 1, referrerId: 1, "wallets.investment": 1 }
//     ).lean();

//     if (!children.length) break;

//     const nextIds = [];
//     let depthSum = 0;

//     for (const child of children) {
//       const activeInv = Number(child?.wallets?.investment || 0);
//       depthSum += activeInv;
//       totalTeamBusiness += activeInv;
//       totalPartners += 1;
//       if (activeInv > 0) totalActivePartners += 1;

//       // attribute direct depth-1 into branch (we'll recompute full branch next)
//       if (depth === 1) {
//         const dId = String(child._id);
//         if (branchBusiness[dId] == null) branchBusiness[dId] = 0;
//         branchBusiness[dId] += activeInv;
//       }
//       nextIds.push(child._id);
//     }

//     levelBusiness[depth] = Number(depthSum.toFixed(8));
//     currentIds = nextIds;
//     depth += 1;
//   }

//   // recompute full per-direct branch sums
//   if (directIds.length) {
//     for (const dId of directIds) branchBusiness[dId] = 0;
//     for (const dId of directIds) {
//       let frontier = [dId];
//       while (frontier.length) {
//         const kids = await User.find(
//           { referrerId: { $in: frontier } },
//           { _id: 1, "wallets.investment": 1 }
//         ).lean();
//         if (!kids.length) break;
//         const next = [];
//         for (const k of kids) {
//           branchBusiness[dId] += Number(k?.wallets?.investment || 0);
//           next.push(k._id);
//         }
//         frontier = next;
//       }
//     }
//   }

//   return {
//     levelBusiness,
//     totalPartners,
//     totalActivePartners,
//     totalTeamBusiness,
//     branchBusiness,
//     directs
//   };
// }

// /**
//  * Compute highest team-unlocked level (no personal cap here).
//  */
// async function computeTeamUnlockedLevels(userId) {
//   const {
//     levelBusiness,
//     totalPartners,
//     totalActivePartners,
//     totalTeamBusiness,
//     branchBusiness,
//     directs
//   } = await computeTeamBusinessByDepth(userId, LEVEL_REQUIREMENTS.length);

//   const directsCount = directs.length;
//   const directsSum = directs.reduce((acc, d) => acc + Number(d?.wallets?.investment || 0), 0);
//   const activeDirectsCount = directs.filter(d => Number(d?.wallets?.investment || 0) > 0).length;

//   const levelStatus = {};

//   // Level-1 rule
//   const requiredL1 = LEVEL_REQUIREMENTS[0];
//   const activeL1 = Number(levelBusiness[1] || 0);
//   const has3Directs = directsCount >= 3;
//   const threeDirectsActive = activeDirectsCount >= 3;
//   const depthHas100 = activeL1 >= requiredL1;

//   const criteriaMetForL1 = has3Directs && threeDirectsActive && depthHas100;

//   levelStatus[1] = {
//     required: requiredL1,
//     active: activeL1,
//     unlocked: true,      // UI shows L1 slot
//     criteriaMet: criteriaMetForL1,
//     stats: { directsCount, activeDirectsCount, directsSum }
//   };

//   if (!criteriaMetForL1) {
//     for (let i = 1; i < LEVEL_REQUIREMENTS.length; i++) {
//       const lvl = i + 1;
//       levelStatus[lvl] = {
//         required: LEVEL_REQUIREMENTS[i],
//         active: Number(levelBusiness[lvl] || 0),
//         unlocked: false
//       };
//     }
//     return {
//       highest: 0,
//       levelStatus,
//       levelBusiness,
//       totalPartners,
//       totalActivePartners,
//       totalTeamBusiness,
//       branchBusiness,
//       directs,
//       directsCount,
//       directsSum,
//       activeDirectsCount,
//       criteriaMetForL1
//     };
//   }

//   // If L1 criteria met => L2 unlocked
//   let highest = 2;
//   levelStatus[2] = {
//     required: LEVEL_REQUIREMENTS[1],
//     active: Number(levelBusiness[2] || 0),
//     unlocked: true
//   };

//   for (let levelNum = 3; levelNum <= LEVEL_REQUIREMENTS.length; levelNum++) {
//     const prevDepth = levelNum - 1;
//     const prevReqIdx = levelNum - 2;
//     const prevRequired = LEVEL_REQUIREMENTS[prevReqIdx];
//     const prevActive = Number(levelBusiness[prevDepth] || 0);
//     const unlocked = prevActive >= prevRequired;

//     levelStatus[levelNum] = {
//       required: LEVEL_REQUIREMENTS[levelNum - 1],
//       active: Number(levelBusiness[levelNum] || 0),
//       unlocked
//     };

//     if (!unlocked) break;
//     highest = levelNum;
//   }

//   return {
//     highest,
//     levelStatus,
//     levelBusiness,
//     totalPartners,
//     totalActivePartners,
//     totalTeamBusiness,
//     branchBusiness,
//     directs,
//     directsCount,
//     directsSum,
//     activeDirectsCount,
//     criteriaMetForL1
//   };
// }

// /** Update user's cached MLM stats on user doc */
// async function upsertUserMlmCache(userId, teamUnlockedLevel, levelBusiness) {
//   const mapObj = {};
//   Object.entries(levelBusiness || {}).forEach(([k, v]) => {
//     mapObj[k] = Number(v || 0);
//   });

//   const businessLevelForCache = Number(teamUnlockedLevel || 0);

//   await User.updateOne(
//     { _id: userId },
//     {
//       $set: {
//         teamBusiness: mapObj,
//         businessLevel: businessLevelForCache,
//         userStatus: businessLevelForCache > 0 ? "active" : "inactive"
//       }
//     }
//   );
// }

// /**
//  * Main: distributeMLMBonus
//  */
// const distributeMLMBonus = async (registeredUser, investmentDelta = 0, opts = {}) => {
//   const emit = typeof opts.emit === "function" ? opts.emit : null;

//   if (!registeredUser || !registeredUser._id) throw new Error("Invalid registered user passed.");
//   const depositAmount = Number(investmentDelta || 0);

//   const triggeringUser = await User.findById(registeredUser._id)
//     .select("_id name email referrerId wallets.investment")
//     .lean();
//   if (!triggeringUser) throw new Error("Triggering user not found in DB.");

//   const results = [];

//   let referrerId = triggeringUser.referrerId;
//   let levelIndex = 0;

//   while (referrerId && levelIndex < MLM_COMMISSIONS.length) {
//     const thisLevelNumber = levelIndex + 1;
//     const percent = Number(MLM_COMMISSIONS[levelIndex] ?? 0);

//     const referrer = await User.findById(referrerId)
//       .select("_id name email referrerId wallets.investment")
//       .lean();
//     if (!referrer) break;

//     // Personal kept for meta only (not capping)
//     const referrerPersonalLevel = computePersonalLevelFromInvestment(referrer?.wallets?.investment || 0);

//     const {
//       highest: referrerTeamUnlockedLevelReal,
//       levelStatus,
//       levelBusiness,
//       totalPartners,
//       totalActivePartners,
//       totalTeamBusiness,
//       branchBusiness,
//       directs,
//       directsCount,
//       directsSum,
//       activeDirectsCount,
//       criteriaMetForL1
//     } = await computeTeamUnlockedLevels(referrer._id);

//     // NO PERSONAL CAP: commission eligibility = team-unlocked only
//     const effectiveLevel = Number(referrerTeamUnlockedLevelReal || 0);

//     const commissionAmount = Number(((depositAmount * percent) / 100).toFixed(8));

//     // --------- FIX: skip locked upline, don't stop chain ---------
//     let eligible = commissionAmount > 0;
//     if (thisLevelNumber > 1 && thisLevelNumber > effectiveLevel) {
//       // locked at this depth => no commission for this referrer, but keep ascending
//       eligible = false;
//     }
//     // --------- FIX END -------------------------------------------

//     const session = await mongoose.startSession();
//     let updatedReferrerDoc = null;
//     try {
//       session.startTransaction();

//       await User.updateOne(
//         { _id: referrer._id },
//         {
//           $set: {
//             teamBusiness: levelBusiness,
//             businessLevel: effectiveLevel,
//             userStatus: effectiveLevel > 0 ? "active" : "inactive"
//           }
//         },
//         { session }
//       );

//       if (eligible) {
//         updatedReferrerDoc = await User.findOneAndUpdate(
//           { _id: referrer._id },
//           {
//             $inc: {
//               "wallets.affiliate": commissionAmount,
//               lifetimeAffiliateEarnings: commissionAmount
//             }
//           },
//           { session, new: true, select: "wallets.affiliate lifetimeAffiliateEarnings" }
//         );

//         if (!updatedReferrerDoc) {
//           await session.abortTransaction();
//           session.endSession();
//           throw new Error(`[MLM][ERROR] Wallet credit failed for referrer ${referrer._id}`);
//         }

//         const commissionDoc = {
//           receiver: {
//             id: referrer._id,
//             name: referrer.name || "Unknown",
//             email: referrer.email || "unknown@example.com"
//           },
//           referralUser: {
//             id: triggeringUser._id,
//             name: triggeringUser.name || "Unknown",
//             email: triggeringUser.email || "unknown@example.com"
//           },
//           level: thisLevelNumber,
//           commission: commissionAmount,
//           plan: {
//             title: opts.plan?.title || "Default Plan",
//             roi: opts.plan?.roi || 0
//           },
//           investment: depositAmount,
//           date: new Date(),
//           status: "paid",
//           meta: {
//             personalLevel: referrerPersonalLevel,
//             teamUnlockedLevel: referrerTeamUnlockedLevelReal,
//             effectiveLevel,
//             levelStatus,
//             levelBusinessSnapshot: levelBusiness,
//             totals: {
//               totalPartners,
//               totalActivePartners,
//               totalTeamBusiness
//             },
//             directsSummary: {
//               count: directsCount,
//               activeCount: activeDirectsCount,
//               sum: directsSum,
//               list: directs.map(d => ({
//                 id: String(d._id),
//                 name: d.name || "Unknown",
//                 email: d.email || "",
//                 activeInvestment: Number(d?.wallets?.investment || 0),
//                 branchBusiness: Number(branchBusiness[String(d._id)] || 0)
//               }))
//             },
//             criteriaMetForL1
//           }
//         };

//         await Commission.create([commissionDoc], { session });
//       }

//       await session.commitTransaction();
//       session.endSession();

//       if (emit && eligible) {
//         try {
//           emit("mlm:commission", {
//             to: String(referrer._id),
//             level: thisLevelNumber,
//             commission: commissionAmount,
//             status: "paid",
//             businessLevel: effectiveLevel,
//             totals: {
//               totalPartners,
//               totalActivePartners,
//               totalTeamBusiness
//             },
//             levelStatus,
//             directs: directs.map(d => ({
//               id: String(d._id),
//               name: d.name || "Unknown",
//               email: d.email || "",
//               activeInvestment: Number(d?.wallets?.investment || 0),
//               branchBusiness: Number(branchBusiness[String(d._id)] || 0)
//             }))
//           });
//         } catch (e) {
//           console.warn("Emit failed:", e);
//         }
//       }

//       if (eligible) {
//         results.push({
//           referrerId: referrer._id,
//           level: thisLevelNumber,
//           paid: true,
//           commissionAmount,
//           paidBalance: updatedReferrerDoc ? (updatedReferrerDoc.wallets?.affiliate ?? null) : null,
//           businessLevelUpdatedTo: effectiveLevel,
//           totals: {
//             totalPartners,
//             totalActivePartners,
//             totalTeamBusiness
//           }
//         });
//       }
//     } catch (err) {
//       try { await session.abortTransaction(); } catch (e) {}
//       try { session.endSession(); } catch (e) {}
//       console.error("[MLM] transaction error:", err);
//       throw err;
//     }

//     // Go up the chain
//     referrerId = referrer.referrerId;
//     levelIndex++;
//   }

//   // Refresh triggering user's cached stats
//   try {
//     const {
//       highest: trigTeamUnlocked,
//       levelBusiness: trigLevelBusiness
//     } = await computeTeamUnlockedLevels(triggeringUser._id);
//     const trigPersonal = computePersonalLevelFromInvestment(triggeringUser?.wallets?.investment || 0);
//     const trigEffective = Number(trigTeamUnlocked || 0); // no personal cap in cache either
//     await upsertUserMlmCache(triggeringUser._id, trigEffective, trigLevelBusiness);
//   } catch (e) {
//     console.warn("Failed to refresh triggering user's MLM cache:", e?.message);
//   }

//   console.log("MLM distribution complete. records:", results.length);
//   return results;
// };

// export default distributeMLMBonus;





















// distributeMLMBonus.js
// Implements hierarchical MLM with per-level (depth) business,
// Level-1 unlock rule (3 directs + depth-1 >= $100 AND those 3 are active),
// dynamic lock/unlock & relock cascade,
// up to 12-level commission distribution,
// and user document updates (teamBusiness map, businessLevel,
// userStatus, affiliate wallet, lifetimeAffiliateEarnings).
// ------------------------------------------------------------

// import mongoose from "mongoose";
// import User from "../Models/authuser.js";
// import Commission from "../Models/admin/commission.js";

// /**
//  * Commission % for each MLM level (index 0 => level 1)
//  * (keep these values as you already had)
//  */
// const MLM_COMMISSIONS = [8, 3, 2, 1, 1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5];

// /**
//  * LEVEL_REQUIREMENTS: active team business required at each depth level
//  */
// const LEVEL_REQUIREMENTS = [
//   100,    // Level 1 (special)
//   200,    // Level 2
//   400,    // Level 3
//   800,    // Level 4
//   1600,   // Level 5
//   3200,   // Level 6
//   6400,   // Level 7
//   12800,  // Level 8
//   25600,  // Level 9
//   51200,  // Level 10
//   102400, // Level 11
//   204800  // Level 12
// ];

// /**
//  * Compute user's personal level from their own active investment.
//  * (kept for meta / logging; doesn't cap commissions in final logic)
//  */
// function computePersonalLevelFromInvestment(investment) {
//   investment = Number(investment || 0);
//   let level = 0;
//   for (let i = 0; i < LEVEL_REQUIREMENTS.length; i++) {
//     if (investment >= LEVEL_REQUIREMENTS[i]) level = i + 1;
//     else break;
//   }
//   return level;
// }

// /** Fetch direct referrals (depth=1). */
// async function getDirects(userId) {
//   return User.find(
//     { referrerId: userId },
//     { _id: 1, name: 1, email: 1, "wallets.investment": 1 }
//   ).lean();
// }

// /**
//  * BFS: compute level-wise team business and per-direct branch sums
//  */
// async function computeTeamBusinessByDepth(userId, maxDepth = LEVEL_REQUIREMENTS.length) {
//   const levelBusiness = {}; // depth -> sum
//   let totalPartners = 0;
//   let totalActivePartners = 0;
//   let totalTeamBusiness = 0;

//   const directs = await getDirects(userId);
//   const directIds = directs.map(d => String(d._id));

//   const branchBusiness = {};
//   for (const dId of directIds) branchBusiness[dId] = 0;

//   let depth = 1;
//   let currentIds = [userId];

//   while (depth <= maxDepth) {
//     const children = await User.find(
//       { referrerId: { $in: currentIds } },
//       { _id: 1, referrerId: 1, "wallets.investment": 1 }
//     ).lean();

//     if (!children.length) break;

//     const nextIds = [];
//     let depthSum = 0;

//     for (const child of children) {
//       const activeInv = Number(child?.wallets?.investment || 0);
//       depthSum += activeInv;
//       totalTeamBusiness += activeInv;
//       totalPartners += 1;
//       if (activeInv > 0) totalActivePartners += 1;

//       if (depth === 1) {
//         const dId = String(child._id);
//         if (branchBusiness[dId] == null) branchBusiness[dId] = 0;
//         branchBusiness[dId] += activeInv;
//       }
//       nextIds.push(child._id);
//     }

//     levelBusiness[depth] = Number(depthSum.toFixed(8));
//     currentIds = nextIds;
//     depth += 1;
//   }

//   // recompute full per-direct branch sums
//   if (directIds.length) {
//     for (const dId of directIds) branchBusiness[dId] = 0;
//     for (const dId of directIds) {
//       let frontier = [dId];
//       while (frontier.length) {
//         const kids = await User.find(
//           { referrerId: { $in: frontier } },
//           { _id: 1, "wallets.investment": 1 }
//         ).lean();
//         if (!kids.length) break;
//         const next = [];
//         for (const k of kids) {
//           branchBusiness[dId] += Number(k?.wallets?.investment || 0);
//           next.push(k._id);
//         }
//         frontier = next;
//       }
//     }
//   }

//   return {
//     levelBusiness,
//     totalPartners,
//     totalActivePartners,
//     totalTeamBusiness,
//     branchBusiness,
//     directs
//   };
// }

// /**
//  * Compute highest team-unlocked level (chain rule described previously)
//  */
// async function computeTeamUnlockedLevels(userId) {
//   const {
//     levelBusiness,
//     totalPartners,
//     totalActivePartners,
//     totalTeamBusiness,
//     branchBusiness,
//     directs
//   } = await computeTeamBusinessByDepth(userId, LEVEL_REQUIREMENTS.length);

//   const directsCount = directs.length;
//   const directsSum = directs.reduce((acc, d) => acc + Number(d?.wallets?.investment || 0), 0);
//   const activeDirectsCount = directs.filter(d => Number(d?.wallets?.investment || 0) > 0).length;

//   const levelStatus = {};

//   // Level-1 rule
//   const requiredL1 = LEVEL_REQUIREMENTS[0];
//   const activeL1 = Number(levelBusiness[1] || 0);
//   const has3Directs = directsCount >= 3;
//   const threeDirectsActive = activeDirectsCount >= 3;
//   const depthHas100 = activeL1 >= requiredL1;

//   const criteriaMetForL1 = has3Directs && threeDirectsActive && depthHas100;

//   levelStatus[1] = {
//     required: requiredL1,
//     active: activeL1,
//     unlocked: true,      // UI shows L1
//     criteriaMet: criteriaMetForL1,
//     stats: { directsCount, activeDirectsCount, directsSum }
//   };

//   if (!criteriaMetForL1) {
//     for (let i = 1; i < LEVEL_REQUIREMENTS.length; i++) {
//       const lvl = i + 1;
//       levelStatus[lvl] = {
//         required: LEVEL_REQUIREMENTS[i],
//         active: Number(levelBusiness[lvl] || 0),
//         unlocked: false
//       };
//     }
//     return {
//       highest: 0,
//       levelStatus,
//       levelBusiness,
//       totalPartners,
//       totalActivePartners,
//       totalTeamBusiness,
//       branchBusiness,
//       directs,
//       directsCount,
//       directsSum,
//       activeDirectsCount,
//       criteriaMetForL1
//     };
//   }

//   // L1 criteria met => L2 unlocked
//   let highest = 2;
//   levelStatus[2] = {
//     required: LEVEL_REQUIREMENTS[1],
//     active: Number(levelBusiness[2] || 0),
//     unlocked: true
//   };

//   for (let levelNum = 3; levelNum <= LEVEL_REQUIREMENTS.length; levelNum++) {
//     const prevDepth = levelNum - 1;
//     const prevReqIdx = levelNum - 2;
//     const prevRequired = LEVEL_REQUIREMENTS[prevReqIdx];
//     const prevActive = Number(levelBusiness[prevDepth] || 0);
//     const unlocked = prevActive >= prevRequired;

//     levelStatus[levelNum] = {
//       required: LEVEL_REQUIREMENTS[levelNum - 1],
//       active: Number(levelBusiness[levelNum] || 0),
//       unlocked
//     };

//     if (!unlocked) break;
//     highest = levelNum;
//   }

//   return {
//     highest,
//     levelStatus,
//     levelBusiness,
//     totalPartners,
//     totalActivePartners,
//     totalTeamBusiness,
//     branchBusiness,
//     directs,
//     directsCount,
//     directsSum,
//     activeDirectsCount,
//     criteriaMetForL1
//   };
// }

// /**
//  * Upsert user's cached MLM stats
//  */
// async function upsertUserMlmCache(userId, teamUnlockedLevel, levelBusiness, session = null) {
//   const mapObj = {};
//   Object.entries(levelBusiness || {}).forEach(([k, v]) => {
//     mapObj[k] = Number(v || 0);
//   });

//   const businessLevelForCache = Number(teamUnlockedLevel || 0);

//   const update = {
//     $set: {
//       teamBusiness: mapObj,
//       businessLevel: businessLevelForCache,
//       userStatus: businessLevelForCache > 0 ? "active" : "inactive"
//     }
//   };

//   if (session) {
//     return User.updateOne({ _id: userId }, update, { session });
//   } else {
//     return User.updateOne({ _id: userId }, update);
//   }
// }

// /**
//  * Main: distributeMLMBonus
//  *
//  * @param {Object|ObjectId} registeredUser - user doc or {_id}
//  * @param {number} investmentDelta - amount invested now
//  * @param {Object} opts - optional { emit, plan }
//  */
// const distributeMLMBonus = async (registeredUser, investmentDelta = 0, opts = {}) => {
//   const emit = typeof opts.emit === "function" ? opts.emit : null;
//   if (!registeredUser || !registeredUser._id) throw new Error("Invalid registered user passed.");
//   const depositAmount = Number(investmentDelta || 0);

//   // fetch triggering user (the one who invested)
//   const triggeringUser = await User.findById(registeredUser._id)
//     .select("_id name email referrerId wallets.investment")
//     .lean();
//   if (!triggeringUser) throw new Error("Triggering user not found in DB.");

//   const results = [];

//   const session = await mongoose.startSession();
//   try {
//     session.startTransaction();

//     // Traverse upline: level 1 => direct parent, level 2 => parent's parent, ...
//     let currentReferrerId = triggeringUser.referrerId;
//     let thisLevelNumber = 1;

//     while (currentReferrerId && thisLevelNumber <= MLM_COMMISSIONS.length) {
//       // load ancestor (referrer) within session
//       const referrer = await User.findById(currentReferrerId)
//         .select("_id name email referrerId wallets.investment customId")
//         .session(session)
//         .lean();

//       if (!referrer) break;

//       // compute team unlocked for this referrer (fresh)
//       const {
//         highest: referrerTeamUnlockedLevelReal,
//         levelStatus,
//         levelBusiness,
//         totalPartners,
//         totalActivePartners,
//         totalTeamBusiness,
//         branchBusiness,
//         directs,
//         directsCount,
//         directsSum,
//         activeDirectsCount,
//         criteriaMetForL1
//       } = await computeTeamUnlockedLevels(referrer._id);

//       // update their cached teamBusiness & businessLevel (so DB stays in sync)
//       await upsertUserMlmCache(referrer._id, referrerTeamUnlockedLevelReal, levelBusiness, session);

//       // commission percent for this relative level
//       const percent = Number(MLM_COMMISSIONS[thisLevelNumber - 1] ?? 0);
//       const commissionAmount = Number(((depositAmount * percent) / 100).toFixed(8));

//       // Decide eligibility:
//       // - Level 1 (direct parent) always eligible (if commissionAmount > 0)
//       // - For levels > 1: eligible only if thisLevelNumber <= referrerTeamUnlockedLevelReal
//       // If not eligible => skip (no pending), but continue to check higher uplines.
//       let eligible = false;
//       if (thisLevelNumber === 1) {
//         eligible = commissionAmount > 0;
//       } else {
//         eligible = commissionAmount > 0 && (thisLevelNumber <= Number(referrerTeamUnlockedLevelReal || 0));
//       }

//       // Debug: (uncomment if you want console-level tracing)
//       // console.log(`DEBUG: Level ${thisLevelNumber}, referrer ${referrer.customId}, teamUnlocked=${referrerTeamUnlockedLevelReal}, eligible=${eligible}`);

//       if (eligible) {
//         // credit wallet and lifetime earnings (within transaction)
//         const updatedReferrerDoc = await User.findOneAndUpdate(
//           { _id: referrer._id },
//           {
//             $inc: {
//               "wallets.affiliate": commissionAmount,
//               lifetimeAffiliateEarnings: commissionAmount
//             }
//           },
//           { session, new: true, select: "wallets.affiliate lifetimeAffiliateEarnings" }
//         );

//         if (!updatedReferrerDoc) {
//           throw new Error(`[MLM][ERROR] Wallet credit failed for referrer ${referrer._id}`);
//         }

//         // create commission record
//         const commissionDoc = {
//           receiver: {
//             id: referrer._id,
//             name: referrer.name || "Unknown",
//             email: referrer.email || "unknown@example.com"
//           },
//           referralUser: {
//             id: triggeringUser._id,
//             name: triggeringUser.name || "Unknown",
//             email: triggeringUser.email || "unknown@example.com"
//           },
//           level: thisLevelNumber,
//           commission: commissionAmount,
//           plan: {
//             title: opts.plan?.title || "Default Plan",
//             roi: opts.plan?.roi || 0
//           },
//           investment: depositAmount,
//           date: new Date(),
//           status: "paid",
//           meta: {
//             personalLevel: computePersonalLevelFromInvestment(referrer?.wallets?.investment || 0),
//             teamUnlockedLevel: referrerTeamUnlockedLevelReal,
//             effectiveLevel: referrerTeamUnlockedLevelReal,
//             levelStatus,
//             levelBusinessSnapshot: levelBusiness,
//             totals: {
//               totalPartners,
//               totalActivePartners,
//               totalTeamBusiness
//             },
//             directsSummary: {
//               count: directsCount,
//               activeCount: activeDirectsCount,
//               sum: directsSum,
//               list: directs.map(d => ({
//                 id: String(d._id),
//                 name: d.name || "Unknown",
//                 email: d.email || "",
//                 activeInvestment: Number(d?.wallets?.investment || 0),
//                 branchBusiness: Number(branchBusiness[String(d._id)] || 0)
//               }))
//             },
//             criteriaMetForL1
//           }
//         };

//         await Commission.create([commissionDoc], { session });

//         // optionally emit real-time event
//         if (emit) {
//           try {
//             emit("mlm:commission", {
//               to: String(referrer._id),
//               level: thisLevelNumber,
//               commission: commissionAmount,
//               status: "paid",
//               businessLevel: referrerTeamUnlockedLevelReal,
//               totals: {
//                 totalPartners,
//                 totalActivePartners,
//                 totalTeamBusiness
//               },
//               levelStatus
//             });
//           } catch (e) {
//             // swallow emit errors
//           }
//         }

//         results.push({
//           referrerId: referrer._id,
//           level: thisLevelNumber,
//           paid: true,
//           commissionAmount,
//           paidBalance: updatedReferrerDoc.wallets?.affiliate ?? null,
//           businessLevelUpdatedTo: referrerTeamUnlockedLevelReal,
//           totals: { totalPartners, totalActivePartners, totalTeamBusiness }
//         });
//       } else {
//         // not eligible: skip — do not create commission, do not mark pending
//         // continue to check higher uplines (so unlocked ancestors above can still receive).
//       }

//       // move one level up
//       currentReferrerId = referrer.referrerId;
//       thisLevelNumber++;
//     } // end while

//     await session.commitTransaction();
//     session.endSession();
//     // Refresh triggering user's cached stats outside transaction (best effort)
//     try {
//       const { highest: trigTeamUnlocked, levelBusiness: trigLevelBusiness } = await computeTeamUnlockedLevels(triggeringUser._id);
//       await upsertUserMlmCache(triggeringUser._id, trigTeamUnlocked, trigLevelBusiness);
//     } catch (e) {
//       console.warn("Failed to refresh triggering user's MLM cache:", e?.message);
//     }

//     console.log("MLM distribution complete. records:", results.length);
//     return results;
//   } catch (err) {
//     try { await session.abortTransaction(); } catch (e) {}
//     try { session.endSession(); } catch (e) {}
//     console.error("[MLM] transaction error:", err);
//     throw err;
//   }
// };

// export default distributeMLMBonus;



























// distributeMLMBonus.js
// Implements hierarchical MLM with per-level (depth) business,
// Level-1 unlock rule (3 directs + depth-1 >= $100 AND those 3 are active),
// dynamic lock/unlock & relock cascade,
// up to 12-level commission distribution,
// and user document updates (teamBusiness map, businessLevel,
// userStatus, affiliate wallet, lifetimeAffiliateEarnings).
// ------------------------------------------------------------

import mongoose from "mongoose";
import User from "../Models/authuser.js";
import Commission from "../Models/admin/commission.js";

/**
 * Commission % for each MLM level (index 0 => level 1)
 * (keep these values as you already had)
 */
const MLM_COMMISSIONS = [8, 3, 2, 1, 1, 1, 1, 1, 0.5, 0.5, 0.5, 0.5];

/**
 * LEVEL_REQUIREMENTS: active team business required at each depth level
 */
const LEVEL_REQUIREMENTS = [
  100,    // Level 1 (special)
  200,    // Level 2
  400,    // Level 3
  800,    // Level 4
  1600,   // Level 5
  3200,   // Level 6
  6400,   // Level 7
  12800,  // Level 8
  25600,  // Level 9
  51200,  // Level 10
  102400, // Level 11
  204800  // Level 12
];

/**
 * Compute user's personal level from their own active investment.
 * (kept for meta / logging; doesn't cap commissions in final logic)
 */
function computePersonalLevelFromInvestment(investment) {
  investment = Number(investment || 0);
  let level = 0;
  for (let i = 0; i < LEVEL_REQUIREMENTS.length; i++) {
    if (investment >= LEVEL_REQUIREMENTS[i]) level = i + 1;
    else break;
  }
  return level;
}

/** Fetch direct referrals (depth=1). */
async function getDirects(userId) {
  return User.find(
    { referrerId: userId },
    { _id: 1, name: 1, email: 1, "wallets.investment": 1 }
  ).lean();
}

/**
 * BFS: compute level-wise team business and per-direct branch sums
 */
async function computeTeamBusinessByDepth(userId, maxDepth = LEVEL_REQUIREMENTS.length) {
  const levelBusiness = {}; // depth -> sum
  let totalPartners = 0;
  let totalActivePartners = 0;
  let totalTeamBusiness = 0;

  const directs = await getDirects(userId);
  const directIds = directs.map(d => String(d._id));

  const branchBusiness = {};
  for (const dId of directIds) branchBusiness[dId] = 0;

  let depth = 1;
  let currentIds = [userId];

  while (depth <= maxDepth) {
    const children = await User.find(
      { referrerId: { $in: currentIds } },
      { _id: 1, referrerId: 1, "wallets.investment": 1 }
    ).lean();

    if (!children.length) break;

    const nextIds = [];
    let depthSum = 0;

    for (const child of children) {
      const activeInv = Number(child?.wallets?.investment || 0);
      depthSum += activeInv;
      totalTeamBusiness += activeInv;
      totalPartners += 1;
      if (activeInv > 0) totalActivePartners += 1;

      if (depth === 1) {
        const dId = String(child._id);
        if (branchBusiness[dId] == null) branchBusiness[dId] = 0;
        branchBusiness[dId] += activeInv;
      }
      nextIds.push(child._id);
    }

    levelBusiness[depth] = Number(depthSum.toFixed(8));
    currentIds = nextIds;
    depth += 1;
  }

  // recompute full per-direct branch sums
  if (directIds.length) {
    for (const dId of directIds) branchBusiness[dId] = 0;
    for (const dId of directIds) {
      let frontier = [dId];
      while (frontier.length) {
        const kids = await User.find(
          { referrerId: { $in: frontier } },
          { _id: 1, "wallets.investment": 1 }
        ).lean();
        if (!kids.length) break;
        const next = [];
        for (const k of kids) {
          branchBusiness[dId] += Number(k?.wallets?.investment || 0);
          next.push(k._id);
        }
        frontier = next;
      }
    }
  }

  return {
    levelBusiness,
    totalPartners,
    totalActivePartners,
    totalTeamBusiness,
    branchBusiness,
    directs
  };
}

/**
 * Compute highest team-unlocked level (chain rule described previously)
 */
async function computeTeamUnlockedLevels(userId) {
  const {
    levelBusiness,
    totalPartners,
    totalActivePartners,
    totalTeamBusiness,
    branchBusiness,
    directs
  } = await computeTeamBusinessByDepth(userId, LEVEL_REQUIREMENTS.length);

  const directsCount = directs.length;
  const directsSum = directs.reduce((acc, d) => acc + Number(d?.wallets?.investment || 0), 0);
  const activeDirectsCount = directs.filter(d => Number(d?.wallets?.investment || 0) > 0).length;

  const levelStatus = {};

  // Level-1 rule
  const requiredL1 = LEVEL_REQUIREMENTS[0];
  const activeL1 = Number(levelBusiness[1] || 0);
  const has3Directs = directsCount >= 3;
  const threeDirectsActive = activeDirectsCount >= 3;
  const depthHas100 = activeL1 >= requiredL1;

  const criteriaMetForL1 = has3Directs && threeDirectsActive && depthHas100;

  levelStatus[1] = {
    required: requiredL1,
    active: activeL1,
    unlocked: true,      // UI shows L1
    criteriaMet: criteriaMetForL1,
    stats: { directsCount, activeDirectsCount, directsSum }
  };

  if (!criteriaMetForL1) {
    for (let i = 1; i < LEVEL_REQUIREMENTS.length; i++) {
      const lvl = i + 1;
      levelStatus[lvl] = {
        required: LEVEL_REQUIREMENTS[i],
        active: Number(levelBusiness[lvl] || 0),
        unlocked: false
      };
    }
    return {
      highest: 0,
      levelStatus,
      levelBusiness,
      totalPartners,
      totalActivePartners,
      totalTeamBusiness,
      branchBusiness,
      directs,
      directsCount,
      directsSum,
      activeDirectsCount,
      criteriaMetForL1
    };
  }

  // L1 criteria met => L2 unlocked
  let highest = 2;
  levelStatus[2] = {
    required: LEVEL_REQUIREMENTS[1],
    active: Number(levelBusiness[2] || 0),
    unlocked: true
  };

  for (let levelNum = 3; levelNum <= LEVEL_REQUIREMENTS.length; levelNum++) {
    const prevDepth = levelNum - 1;
    const prevReqIdx = levelNum - 2;
    const prevRequired = LEVEL_REQUIREMENTS[prevReqIdx];
    const prevActive = Number(levelBusiness[prevDepth] || 0);
    const unlocked = prevActive >= prevRequired;

    levelStatus[levelNum] = {
      required: LEVEL_REQUIREMENTS[levelNum - 1],
      active: Number(levelBusiness[levelNum] || 0),
      unlocked
    };

    if (!unlocked) break;
    highest = levelNum;
  }

  return {
    highest,
    levelStatus,
    levelBusiness,
    totalPartners,
    totalActivePartners,
    totalTeamBusiness,
    branchBusiness,
    directs,
    directsCount,
    directsSum,
    activeDirectsCount,
    criteriaMetForL1
  };
}

/**
 * Upsert user's cached MLM stats
 */
async function upsertUserMlmCache(userId, teamUnlockedLevel, levelBusiness, session = null) {
  const mapObj = {};
  Object.entries(levelBusiness || {}).forEach(([k, v]) => {
    mapObj[k] = Number(v || 0);
  });

  const businessLevelForCache = Number(teamUnlockedLevel || 0);

  const update = {
    $set: {
      teamBusiness: mapObj,
      businessLevel: businessLevelForCache,
      userStatus: businessLevelForCache > 0 ? "active" : "inactive"
    }
  };

  if (session) {
    return User.updateOne({ _id: userId }, update, { session });
  } else {
    return User.updateOne({ _id: userId }, update);
  }
}

/**
 * Main: distributeMLMBonus
 *
 * @param {Object|ObjectId} registeredUser - user doc or {_id}
 * @param {number} investmentDelta - amount invested now
 * @param {Object} opts - optional { emit, plan }
 */
const distributeMLMBonus = async (registeredUser, investmentDelta = 0, opts = {}) => {
  const emit = typeof opts.emit === "function" ? opts.emit : null;
  if (!registeredUser || !registeredUser._id) throw new Error("Invalid registered user passed.");
  const depositAmount = Number(investmentDelta || 0);

  // fetch triggering user (the one who invested)
  const triggeringUser = await User.findById(registeredUser._id)
    .select("_id name email referrerId wallets.investment")
    .lean();
  if (!triggeringUser) throw new Error("Triggering user not found in DB.");

  const results = [];

  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // Traverse upline: level 1 => direct parent, level 2 => parent's parent, ...
    let currentReferrerId = triggeringUser.referrerId;
    let thisLevelNumber = 1;

    while (currentReferrerId && thisLevelNumber <= MLM_COMMISSIONS.length) {
      // load ancestor (referrer) within session
      const referrer = await User.findById(currentReferrerId)
        .select("_id name email referrerId wallets.investment customId")
        .session(session)
        .lean();

      if (!referrer) break;

      // compute team unlocked for this referrer (fresh)
      const {
        highest: referrerTeamUnlockedLevelReal,
        levelStatus,
        levelBusiness,
        totalPartners,
        totalActivePartners,
        totalTeamBusiness,
        branchBusiness,
        directs,
        directsCount,
        directsSum,
        activeDirectsCount,
        criteriaMetForL1
      } = await computeTeamUnlockedLevels(referrer._id);

      // update their cached teamBusiness & businessLevel (so DB stays in sync)
      await upsertUserMlmCache(referrer._id, referrerTeamUnlockedLevelReal, levelBusiness, session);

      // commission percent for this relative level
      const percent = Number(MLM_COMMISSIONS[thisLevelNumber - 1] ?? 0);
      const commissionAmount = Number(((depositAmount * percent) / 100).toFixed(8));

let eligible = false;

if (thisLevelNumber === 1) {
  // Direct parent always gets commission
  eligible = commissionAmount > 0;
} else {
  // Agar current referrer ka teamUnlockedLevel >= thisLevelNumber → unlocked, eligible hai
  if (commissionAmount > 0 && referrerTeamUnlockedLevelReal >= thisLevelNumber) {
    eligible = true; // unlocked level → commission milega
  } else {
    eligible = false; // locked level → skip, but chain continue karegi
  }
}



if (!eligible) {
  //  DO NOT use upline here, use the current referrer
  currentReferrerId = referrer.referrerId;
  thisLevelNumber++;
  continue; // move further up, check next ancestor
}


      // Debug: (uncomment if you want console-level tracing)
      // console.log(`DEBUG: Level ${thisLevelNumber}, referrer ${referrer.customId}, teamUnlocked=${referrerTeamUnlockedLevelReal}, eligible=${eligible}`);

      if (eligible) {
        // credit wallet and lifetime earnings (within transaction)
        const updatedReferrerDoc = await User.findOneAndUpdate(
          { _id: referrer._id },
          {
            $inc: {
              "wallets.affiliate": commissionAmount,
              lifetimeAffiliateEarnings: commissionAmount
            }
          },
          { session, new: true, select: "wallets.affiliate lifetimeAffiliateEarnings" }
        );

        if (!updatedReferrerDoc) {
          throw new Error(`[MLM][ERROR] Wallet credit failed for referrer ${referrer._id}`);
        }

        // create commission record
        const commissionDoc = {  
          receiver: {
            id: referrer._id,
            name: referrer.name || "Unknown",
            email: referrer.email || "unknown@example.com"
          },
          referralUser: {
            id: triggeringUser._id,
            name: triggeringUser.name || "Unknown",
            email: triggeringUser.email || "unknown@example.com"
          },
          level: thisLevelNumber,
          commission: commissionAmount,
          plan: {
            title: opts.plan?.title || "Default Plan",
            roi: opts.plan?.roi || 0
          },
          investment: depositAmount,
          date: new Date(),
          status: eligible === "paid",
          meta: {
            personalLevel: computePersonalLevelFromInvestment(referrer?.wallets?.investment || 0),
            teamUnlockedLevel: referrerTeamUnlockedLevelReal,
            effectiveLevel: referrerTeamUnlockedLevelReal,
            levelStatus,
            levelBusinessSnapshot: levelBusiness,
            totals: {
              totalPartners,
              totalActivePartners,
              totalTeamBusiness
            },
            directsSummary: {
              count: directsCount,
              activeCount: activeDirectsCount,
              sum: directsSum,
              list: directs.map(d => ({
                id: String(d._id),
                name: d.name || "Unknown",
                email: d.email || "",
                activeInvestment: Number(d?.wallets?.investment || 0),
                branchBusiness: Number(branchBusiness[String(d._id)] || 0)
              }))
            },
            criteriaMetForL1
          }
        };

        await Commission.create([commissionDoc], { session });

        // optionally emit real-time event
        if (emit) {
          try {
            emit("mlm:commission", {
              to: String(referrer._id),
              level: thisLevelNumber,
              commission: commissionAmount,
              status: "paid",
              businessLevel: referrerTeamUnlockedLevelReal,
              totals: {
                totalPartners,
                totalActivePartners,
                totalTeamBusiness
              },
              levelStatus
            });
          } catch (e) {
            // swallow emit errors
          }
        }

        results.push({
          referrerId: referrer._id,
          level: thisLevelNumber,
          paid: true,
          commissionAmount,
          paidBalance: updatedReferrerDoc.wallets?.affiliate ?? null,
          businessLevelUpdatedTo: referrerTeamUnlockedLevelReal,
          totals: { totalPartners, totalActivePartners, totalTeamBusiness }
        });
      } else {
        // not eligible: skip — do not create commission, do not mark pending
        // continue to check higher uplines (so unlocked ancestors above can still receive).
      }

      // move one level up
      currentReferrerId = referrer.referrerId;
      thisLevelNumber++;
    } // end while

    await session.commitTransaction();
    session.endSession();
    // Refresh triggering user's cached stats outside transaction (best effort)
    try {
      const { highest: trigTeamUnlocked, levelBusiness: trigLevelBusiness } = await computeTeamUnlockedLevels(triggeringUser._id);
      await upsertUserMlmCache(triggeringUser._id, trigTeamUnlocked, trigLevelBusiness);
    } catch (e) {
      console.warn("Failed to refresh triggering user's MLM cache:", e?.message);
    }

    console.log("MLM distribution complete. records:", results.length);
    return results;
  } catch (err) {
    try { await session.abortTransaction(); } catch (e) {}
    try { session.endSession(); } catch (e) {}
    console.error("[MLM] transaction error:", err);
    throw err;
  }
};

export default distributeMLMBonus;



















