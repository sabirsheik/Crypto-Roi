import User from "../../Models/authuser.js";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { sendEmail } from "../../utils/createManagerMail.js";
import crypto from "crypto";
export const createManager = async (req, res) => {
  try {
    const { name, email, password, role = "manager", permissions = {} } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const tempPassword = password && password.length >= 6 ? password : crypto.randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newManager = new User({
      customId: uuidv4(),
      name,
      email,
      password: hashedPassword,
      role,
      userStatus: "active",
      permissions: {
        manageUsers: !!permissions.manageUsers,
        investmentPlans: !!permissions.investmentPlans,
        deposit: !!permissions.deposit,
        withdrawals: !!permissions.withdrawals,
        commissionLogs: !!permissions.commissionLogs,
        mlmTree: !!permissions.mlmTree,
      }
    });

    await newManager.save();

    // Email HTML Template
    const html = `
      <p>Hi ${newManager.name},</p>
      <p>You have been created as a <strong>${newManager.role}</strong> on <strong>Your App Name</strong>.</p>
      <p>Login: <strong>${newManager.email}</strong></p>
      <p>Temporary password: <strong>${tempPassword}</strong></p>
      <p>Login here: <a href="${process.env.CLIENT}/login">${process.env.CLIENT}/login</a></p>
      <p>After login please change your password immediately.</p>
    `;

    // Call email function
    await sendEmail(newManager.email, "Welcome to Your App - Manager Account Created", html);

    res.status(201).json({
      message: "Manager created successfully",
      manager: {
        id: newManager._id,
        name: newManager.name,
        email: newManager.email,
        role: newManager.role,
        permissions: newManager.permissions
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const updateManagerAccess = async (req, res) => {
  try {
    const { managerId } = req.params;
    const { permissions } = req.body;

    const manager = await User.findOne({ _id: managerId, role: { $in: ["manager"] } });
    if (!manager) return res.status(404).json({ message: "Manager not found" });

    // merge with existing permissions - validate keys
    const allowedKeys = ['manageUsers', 'investmentPlans', 'deposit', 'withdrawals', 'commissionLogs', 'mlmTree'];
    for (const k of allowedKeys) {
      if (permissions.hasOwnProperty(k)) {
        manager.permissions[k] = !!permissions[k];
      }
    }

    await manager.save();

    res.json({ message: "Permissions updated successfully", permissions: manager.permissions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: { $in: ["manager"] } })
      .select("-password -__v");
    res.json(managers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export const deleteManager = async (req, res) => {
  try {
    const { managerId } = req.params;
    const manager = await User.findOneAndDelete({ _id: managerId, role: { $in: ["manager"] } });
    if (!manager) return res.status(404).json({ message: "Manager not found" });

    // Optional: remove/transfer any resources owned by this manager
    // e.g., reassign users they created, clear referrerId etc.

    res.json({ message: "Manager deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
