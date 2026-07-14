// controllers/admin/mlmTreeController.js
import User from "../../Models/authuser.js";
import getReferralTree from "../../utils/generateReferral.js";

export const getAllMLMTrees = async (req, res, next) => {
  try {
    const frontendUrl = process.env.Client;

    // ✅ Only root users = jin ka koi referrer nahi hai
    const rootUsers = await User.find({ referrerId: { $exists: false } }).lean();

    const trees = [];
    for (let root of rootUsers) {
      const referrals = await getReferralTree(root._id, 12, frontendUrl);

      trees.push({
        _id: root._id,
        name: root.name,
        email: root.email,
        referralCode: root.referralCode,
        referralLink: root.referralCode
          ? `${frontendUrl}/register?ref=${root.referralCode}`
          : null,
        role: root.role,
        wallets: root.wallets,
        createdAt: root.createdAt,
        businessLevel: root.businessLevel || 0,
        referrals,
      });
    }

    return res.status(200).json({
      success: true,
      trees,
    });
  } catch (err) {
    console.error("MLM Tree Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to load MLM tree",
    });
  }
};

export const getMLMTree = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select("name email referralCode wallets createdAt");
    if (!user) return res.status(404).json({ message: "User not found" });

    const tree = {
      _id: user._id,
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
      businessLevel: user.wallets?.businessLevel || 1,
      createdAt: user.createdAt,
      level: 0,
      children: await getReferralTree(user._id) // ⚡ Now infinite depth
    };

    res.status(200).json({ success: true, tree });
  } catch (err) {
    next(err);
  }
};