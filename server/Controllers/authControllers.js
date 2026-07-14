import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../Models/authuser.js';
import getReferralTree from '../utils/generateReferral.js';
import sendOtp from '../utils/sendOtp.js';
import sendResetLink from '../utils/sendRestLink.js';
import crypto from 'crypto';
import sendRegistrationMail from '../utils/sendRegistrationMail.js';




const generateReferralCode = () => {
  try {
    const randomNumber = Math.floor(10000 + Math.random() * 90000); // 5-digit number
    return `ATW${randomNumber}`;
  } catch (error) {
    console.log(`message : ${error}`)
  }
};


const generateCustomId = async () => {
  let unique = false;
  let customId;
  while (!unique) {
    customId = 'ATW' + Math.floor(10000000 + Math.random() * 90000000);
    const existing = await User.findOne({ customId });
    if (!existing) unique = true;
  }
  return customId;
};


// controllers/authController.js

const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, refCode, country, phone, role } = req.body;

    // ✅ Confirm password check
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) return res.status(400).json({ message: "Phone already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const referralCode = generateReferralCode();
    const customId = await generateCustomId();

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      country,
      phone,
      referralCode,
      customId,
      referralLink: `${process.env.Client}/register?ref=${referralCode}`,
      role: role && ["user", "admin", "manager"].includes(role) ? role : "user",
    });

    if (refCode) {
      const referrer = await User.findOne({ referralCode: refCode });
      if (!referrer) return res.status(400).json({ message: "Invalid referral code." });
      newUser.referrerId = referrer._id;
    }

    await newUser.save();

    await sendRegistrationMail(email, name, customId);

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({
      message: "User registered & logged in.",
      token,
      user: {
        id: newUser._id,
        customId: newUser.customId,
        name: newUser.name,
        email: newUser.email,
        country: newUser.country,
        phone: newUser.phone,
        referralCode: newUser.referralCode,
        referralLink: newUser.referralLink,
        role: newUser.role,
        wallets: newUser.wallets,
        businessLevel: newUser.level,
      },
    });
  } catch (error) {
    next(error);
  }
};



// const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Invalid Email" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid Password." });

//     // For Admin/Manager → Send OTP
//     if (user.role === "admin" || user.role === "manager") {
//       const otp = Math.floor(100000 + Math.random() * 900000);
//       user.otpCode = otp;
//       user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
//       user.twoFactorVerified = false; // Reset 2FA
//       await user.save();

//       await sendOtp(email, otp);

//       return res.status(200).json({
//         message: "OTP sent to your email. Please verify.",
//         role: user.role,
//         step: "otp_required"
//       });
//     }

//     // For normal user → Direct Token
//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
//       expiresIn: "30d"
//     });

//     res.json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email,
//         country: user.country,
//         phone: user.phone,
//         referralCode: user.referralCode,
//         referralLink: user.referralLink,
//         role: user.role,
//         wallets: user.wallets,
//         businessLevel: user.level,
//         permissions: user.permissions || {},
//         twoFactorVerified: user.twoFactorVerified,
//         createDate: new Date(user.createdAt).toLocaleString("en-GB", {
//           timeZone: "Asia/Karachi",
//           day: "2-digit",
//           month: "2-digit",
//           year: "numeric",
//           hour: "2-digit",
//           minute: "2-digit",
//           second: "2-digit"
//         })
//       }
//     });


//   } catch (err) {
//     next(err);
//   }
// };

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).lean();
    if (!user) return res.status(400).json({ message: "Invalid Email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Password." });

    if (user.role === "admin" || user.role === "manager") {
      const otp = Math.floor(100000 + Math.random() * 900000);
      await User.updateOne(
        { _id: user._id },
        {
          $set: {
            otpCode: otp,
            otpExpires: new Date(Date.now() + 5 * 60 * 1000),
            twoFactorVerified: false
          }
        }
      );

      sendOtp(email, otp).catch(err => console.error("OTP send failed:", err));

      return res.status(200).json({
        message: "OTP sent to your email. Please verify.",
        role: user.role,
        step: "otp_required"
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d"
    });

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        country: user.country,
        phone: user.phone,
        referralCode: user.referralCode,
        referralLink: user.referralLink,
        role: user.role,
        wallets: user.wallets,
        businessLevel: user.level,
        permissions: user.permissions || {},
        twoFactorVerified: user.twoFactorVerified,
        createDate: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};





const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.role === "user") return res.status(400).json({ message: "2FA not required for normal user." });

    if (!user.otpCode || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "OTP expired or not generated." });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // Mark 2FA verified
    user.twoFactorVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    // Send JWT now
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h"
    });

    res.json({
      message: "2FA verified. Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    next(error);
  }
};


const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Generate secure token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // ✅ Hash token for DB
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // ✅ Set token and expiry
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // ✅ Send reset link
    const resetUrl = `${process.env.Client}/reset-password/${resetToken}`;
    await sendResetLink(user.email, resetUrl);
    sendResetLink
    return res.status(200).json({ message: "Reset link sent to your email" });
  } catch (error) {
    // console.error("Forgot Password Error:", err);
    // res.status(500).json({ message: "Something went wrong" });
    next(error);
  }
};

// RESET PASSWORD — Step 2

const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    // 🔐 Hash the token received from frontend
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // 🔍 Find matching user
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // 🔑 Set new password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({ message: "Password reset successful." });
  } catch (error) {
    // console.error("Reset error:", err.message);
    // return res.status(500).json({ message: "Something went wrong" });
    next(error);
  }
};


const getUserInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("referrerId", "name")
      .select("-password -__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tree = await getReferralTree(user._id);

    res.json({
      ...user.toObject(),  
      sponsorName: user.referrerId?.name || null,
      totalReferrals: tree.length,
      tree: tree,
      createDate: user.createdAt

    });
  } catch (error) {
    next(error);
  }
};


const updateProfileAndPassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, country, currentPassword, newPassword } = req.body;

    // 1. Check email conflict
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ message: 'Email is already in use by another user.' });
    }

    // 2. Prepare update object
    const updateData = { name, email, phone, country };

    // 3. If password change requested
    if (currentPassword && newPassword) {
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found.' });

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect.' });

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedNewPassword;
    }

    // 4. Update user
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select(
      '-password'
    );

    res.status(200).json({
      message: 'Profile updated successfully.',
      user: updatedUser,
    });
  } catch (error) {
    // res.status(500).json({ message: 'Failed to update profile.', error: error.message });
    next(error);
  }
};


const getInfoById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate ObjectId if necessary
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const user = await User.findById(userId).select('name');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ name: user.name });
  } catch (error) {
    // console.error('Error fetching user name:', error.message);
    // return res.status(500).json({ error: 'Server error' });
    next(error);
  }
};



//  Admin View User Dashborad

const impersonateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Target user find karo
    const user = await User.findById(userId).select("_id name email role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Impersonation token generate karo (short-lived)
    const token = jwt.sign(
      {
        id: user._id,          // normal login ki tarah hi rakha
        role: user.role,
        actAs: true,           // special flag
        impersonatedBy: req.user.id, // kis admin ne impersonate kiya
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }     // short expiry
    );

    // 3. Response
    res.status(200).json({
      token,
      impersonatedUser: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Impersonate error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  register,
  login,
  verifyOtp,
  getUserInfo,
  forgotPassword,
  resetPassword,
  updateProfileAndPassword,
  getInfoById,
  impersonateUser
}
