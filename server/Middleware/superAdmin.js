import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../Models/authuser.js";

dotenv.config();

export default async function requireSuperAdmin(req, res, next) {
  try {
    let email = req.user?.email;

    // If req.user not set, decode JWT
    if (!email) {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: token missing" });
      }
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (!decoded?.id) return res.status(401).json({ message: "Unauthorized" });

      const user = await User.findById(decoded.id).select("email role");
      if (!user) return res.status(401).json({ message: "Unauthorized" });
      req.user = user;
      email = user.email;
    }

    // Allow multiple super admins (comma-separated in .env)
    const allowedEmails = (process.env.SUPER_ADMIN_EMAILS ||
      process.env.SUPER_ADMIN_EMAIL ||
      "sabirsheik12787@gmail.com"
    )
      .split(",")
      .map(e => e.trim().toLowerCase());

    if (!email || !allowedEmails.includes(email.toLowerCase())) {
      return res.status(403).json({ message: "Forbidden: super admin only" });
    }

    next();
  } catch (err) {
    next(err);
  }
}
