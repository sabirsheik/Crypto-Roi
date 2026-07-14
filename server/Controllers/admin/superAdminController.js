// // Server/Controllers/admin/superAdminController.js
// import bcrypt from "bcryptjs";
// import crypto from "crypto";
// import mongoose from "mongoose";
// import User from "../../Models/authuser.js";
// import { sendMail } from "../../utils/adminAccess.js";
// import { v4 as uuidv4 } from "uuid";

// const ALLOWED_PERMISSIONS = [
//   "manageUsers",
//   "investmentPlans",
//   "deposit",
//   "withdrawals",
//   "commissionLogs",
//   "mlmTree",
// ];

// // Helper: create a strong temporary password
// function generateTempPassword(len = 10) {
//   return crypto.randomBytes(Math.ceil(len / 2)).toString("hex").slice(0, len);
// }

// // Utility: sanitize permissions object - keep only allowed keys and booleans
// function sanitizePermissions(raw) {
//   const result = {};
//   if (!raw || typeof raw !== "object") return result;
//   Object.keys(raw).forEach((k) => {
//     if (ALLOWED_PERMISSIONS.includes(k)) {
//       result[k] = Boolean(raw[k]);
//     }
//   });
//   return result;
// }

// /**
//  * GET /api/admin/admins
//  * - returns all users with role 'admin'
//  */
// export async function getAdmins(req, res, next) {
//   try {
//     const admins = await User.find({ role: "admin" })
//       .select("_id name email role permissions createdAt")
//       .lean();
//     res.json({ success: true, data: admins });
//   } catch (err) {
//     next(err);
//   }
// }

// /**
//  * POST /api/admin/create
//  * body: { email, name, permissions }
//  * - If user exists -> promote to admin (update permissions)
//  * - If not -> create user with role admin and temporary password (hashed), email sent
//  */
// export async function createAdmin(req, res, next) {
//   try {
//     const { email, name = "", permissions = {} } = req.body;
//     if (!email) return res.status(400).json({ message: "Email is required" });

//     const normalized = String(email).trim().toLowerCase();
//     let user = await User.findOne({ email: normalized });

//     const safePermissions = sanitizePermissions(permissions);

//     if (user && user.role === "admin") {
//       return res.status(400).json({ message: "User is already an admin" });
//     }

//     if (user) {
//       // Promote existing user
//       user.role = "admin";
//       if (name) user.name = name;
//       user.permissions = { ...((user.permissions || {})), ...safePermissions };
//       await user.save();

//       // send promotion email
//       await sendMail({
//         to: user.email,
//         subject: "You were promoted to Admin",
//         text: `Hello ${user.name || ""},\n\nYour account has been promoted to Admin.\n\nIf you did not expect this, contact super admin.\n`,
//       });

//       return res.json({ success: true, message: "User promoted to admin", data: { id: user._id, email: user.email } });
//     }

//     // Create new admin with temporary password
//     const tempPassword = generateTempPassword(12);
//     const hashed = await bcrypt.hash(tempPassword, 10);

//     const newUser = new User({
//       customId: `ATW${Date.now()}`,
//       name,
//       email: normalized,
//       password: hashed,
//       role: "admin",
//       permissions: safePermissions,
//     });

//     await newUser.save();

//     // send email with temp password (ask user to reset on login)
//     const html = `
//       <p>Hello ${name || ""},</p>
//       <p>An admin account was created for you.</p>
//       <p><strong>Email:</strong> ${normalized}</p>
//       <p><strong>Temporary password:</strong> ${tempPassword}</p>
//       <p>Please login and <strong>reset your password</strong> immediately.</p>
//     `;
//     await sendMail({
//       to: normalized,
//       subject: "Admin account created",
//       text: `Temporary password: ${tempPassword}`,
//       html,
//     });

//     res.status(201).json({ success: true, message: "Admin account created and email sent", data: { id: newUser._id, email: normalized } });
//   } catch (err) {
//     next(err);
//   }
// }

// /**
//  * PUT /api/admin/:id
//  * body: { name?, permissions?, password?, email? }
//  * - uses id param (Mongo ObjectId)
//  */
// export async function updateAdmin(req, res, next) {
//   try {
//     const targetId = String(req.params.id || "");
//     if (!mongoose.Types.ObjectId.isValid(targetId)) return res.status(400).json({ message: "Invalid id" });

//     const { name, permissions, password, email: newEmail } = req.body;

//     const user = await User.findById(targetId);
//     if (!user || user.role !== "admin") {
//       return res.status(404).json({ message: "Admin not found" });
//     }

//     if (name) user.name = name;
//     if (permissions) user.permissions = { ...((user.permissions || {})), ...sanitizePermissions(permissions) };
//     if (password) user.password = await bcrypt.hash(password, 10);

//     if (newEmail && newEmail.toLowerCase() !== (user.email || "").toLowerCase()) {
//       const exists = await User.findOne({ email: newEmail.toLowerCase() });
//       if (exists) return res.status(400).json({ message: "Email already in use" });
//       user.email = newEmail.toLowerCase();
//     }

//     await user.save();

//     // notify about changes
//     await sendMail({
//       to: user.email,
//       subject: "Your admin account was updated",
//       text: `Hello ${user.name || ""},\nYour admin account was updated by super admin.`,
//     });

//     res.json({ success: true, message: "Admin updated", data: { id: user._id, email: user.email } });
//   } catch (err) {
//     next(err);
//   }
// }

// /**
//  * DELETE /api/admin/:id
//  * Query: ?hard=true  -> permanently delete
//  * Default: soft-demote to role='user' (recommended)
//  */
// export async function deleteAdmin(req, res, next) {
//   try {
//     const targetId = String(req.params.id || "");
//     if (!mongoose.Types.ObjectId.isValid(targetId)) return res.status(400).json({ message: "Invalid id" });

//     const hard = req.query.hard === "true";

//     const user = await User.findById(targetId);
//     if (!user || user.role !== "admin") {
//       return res.status(404).json({ message: "Admin not found" });
//     }

//     if (hard) {
//       await User.deleteOne({ _id: targetId });
//       await sendMail({
//         to: user.email,
//         subject: "Admin account deleted",
//         text: `Your admin account has been permanently deleted by super admin.`,
//       });
//       return res.json({ success: true, message: "Admin permanently deleted" });
//     }

//     // Soft-demote
//     user.role = "user";
//     user.permissions = {}; // clear admin permissions
//     await user.save();

//     await sendMail({
//       to: user.email,
//       subject: "Admin privileges removed",
//       text: `Your admin privileges have been removed by super admin.`,
//     });

//     res.json({ success: true, message: "Admin demoted to user (soft delete)" });
//   } catch (err) {
//     next(err);
//   }
// }



// Server/Controllers/admin/superAdminController.js
import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";
import User from "../../Models/authuser.js";
import { sendMail } from "../../utils/adminAccess.js";

/**
 * Helper: create a strong temporary password
 */
function generateTempPassword(len = 10) {
  return crypto.randomBytes(Math.ceil(len / 2)).toString("hex").slice(0, len);
}

/**
 * Professional HTML templates
 */
function htmlTemplate(title, intro, lines = [], footer = "") {
  const itemsHtml = lines.map(line => `<p style="margin:0 0 8px 0">${line}</p>`).join("");
  return `
  <div style="font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color:#111; padding:20px;">
    <div style="max-width:700px; margin:0 auto; border:1px solid #e6e9ee; border-radius:12px; overflow:hidden;">
      <div style="background:linear-gradient(90deg,#0ea5a4 0%, #059669 100%); padding:24px; color:white;">
        <h1 style="margin:0; font-size:20px">${title}</h1>
      </div>
      <div style="background:#fff; padding:20px;">
        <p style="margin:0 0 12px 0; color:#333;">${intro}</p>
        ${itemsHtml}
        ${footer ? `<div style="margin-top:18px; font-size:13px; color:#666;">${footer}</div>` : ""}
      </div>
      <div style="background:#f7fafc; padding:12px; text-align:center; font-size:12px; color:#8892a6;">
        © ${new Date().getFullYear()} Your AI WORLD TECH — All rights reserved.
      </div>
    </div>
  </div>`;
}

/**
 * GET /api/admin/admins
 * - returns all users with role 'admin'
 */
export async function getAdmins(req, res, next) {
  try {
    const admins = await User.find({ role: "admin" })
      .select("_id name email role createdAt customId")
      .lean();
    res.json({ success: true, data: admins });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/create
 * body: { email, name }
 * - If user exists -> promote to admin
 * - If not -> create user with role admin and temporary password (hashed), email sent
 */
export async function createAdmin(req, res, next) {
  try {
    const { email, name = "" } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const normalized = String(email).trim().toLowerCase();
    let user = await User.findOne({ email: normalized });

    if (user && user.role === "admin") {
      return res.status(400).json({ message: "User is already an admin" });
    }

    if (user) {
      // Promote existing user
      user.role = "admin";
      if (name) user.name = name;
      await user.save();

      // send promotion email (professional)
      const html = htmlTemplate(
        "You've been promoted to Admin",
        `Hello ${user.name || ""},`,
        [
          "Your account has been elevated to Admin status by the Super Admin.",
          "You now have administrative access. If you did not expect this change, please contact the Super Admin immediately."
        ],
        "If you have any questions, reply to this email or reach out to support."
      );

      await sendMail({
        to: user.email,
        subject: "You've been promoted to Admin",
        text: `Hi ${user.name || ""}, your account has been promoted to Admin.`,
        html,
      });

      return res.json({ success: true, message: "User promoted to admin", data: { id: user._id, email: user.email } });
    }

    // Create new admin with temporary password
    const tempPassword = generateTempPassword(12);
    const hashed = await bcrypt.hash(tempPassword, 10);

    const newUser = new User({
      customId: `ATW${Date.now()}`,
      name,
      email: normalized,
      password: hashed,
      role: "admin",
    });

    await newUser.save();

    // send email with temp password (professional HTML)
    const html = htmlTemplate(
      "Admin Account Created",
      `Hello ${name || ""},`,
      [
        `An admin account has been created for you.`,
        `<strong>Email:</strong> ${normalized}`,
        `<strong>Temporary password:</strong> ${tempPassword}`,
        `Please log in and reset your password immediately for security.`
      ],
      "For security, do not share your password with anyone. If you didn't request this, contact support."
    );

    await sendMail({
      to: normalized,
      subject: "Admin account created",
      text: `Temporary password: ${tempPassword}`,
      html,
    });

    res.status(201).json({ success: true, message: "Admin account created and email sent", data: { id: newUser._id, email: normalized } });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/:id
 * body: { name?, password?, email? }
 * - uses id param (Mongo ObjectId)
 */
export async function updateAdmin(req, res, next) {
  try {
    const targetId = String(req.params.id || "");
    if (!mongoose.Types.ObjectId.isValid(targetId)) return res.status(400).json({ message: "Invalid id" });

    const { name, password, email: newEmail } = req.body;

    const user = await User.findById(targetId);
    if (!user || user.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (name) user.name = name;
    if (password) user.password = await bcrypt.hash(password, 10);

    if (newEmail && newEmail.toLowerCase() !== (user.email || "").toLowerCase()) {
      const exists = await User.findOne({ email: newEmail.toLowerCase() });
      if (exists) return res.status(400).json({ message: "Email already in use" });
      user.email = newEmail.toLowerCase();
    }

    await user.save();

    // notify about changes
    const html = htmlTemplate(
      "Your admin account was updated",
      `Hello ${user.name || ""},`,
      [
        "Your admin profile has been updated by the Super Admin.",
        `If email was changed, use the new email to sign in: ${user.email}`
      ],
      "If you did not request these changes, please contact the Super Admin immediately."
    );

    await sendMail({
      to: user.email,
      subject: "Admin account updated",
      text: `Your admin account was updated.`,
      html,
    });

    res.json({ success: true, message: "Admin updated", data: { id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/:id
 * Query: ?hard=true  -> permanently delete
 * Default: soft-demote to role='user' (recommended)
 */
export async function deleteAdmin(req, res, next) {
  try {
    const targetId = String(req.params.id || "");
    if (!mongoose.Types.ObjectId.isValid(targetId)) return res.status(400).json({ message: "Invalid id" });

    const hard = req.query.hard === "true";

    const user = await User.findById(targetId);
    if (!user || user.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    if (hard) {
      await User.deleteOne({ _id: targetId });

      const html = htmlTemplate(
        "Admin account deleted",
        `Hello,`,
        [
          `Your admin account (${user.email}) has been permanently deleted by Super Admin.`,
          "If you believe this is a mistake, contact the Super Admin immediately."
        ],
        ""
      );

      await sendMail({
        to: user.email,
        subject: "Admin account deleted",
        text: `Your admin account has been permanently deleted.`,
        html,
      });

      return res.json({ success: true, message: "Admin permanently deleted" });
    }

    // Soft-demote
    user.role = "user";
    await user.save();

    const html = htmlTemplate(
      "Admin privileges removed",
      `Hello ${user.name || ""},`,
      [
        `Your admin privileges have been removed by Super Admin.`,
        "You can still access your account as a regular user."
      ],
      ""
    );

    await sendMail({
      to: user.email,
      subject: "Admin privileges removed",
      text: `Your admin privileges have been removed.`,
      html,
    });

    res.json({ success: true, message: "Admin demoted to user (soft delete)" });
  } catch (err) {
    next(err);
  }
}
