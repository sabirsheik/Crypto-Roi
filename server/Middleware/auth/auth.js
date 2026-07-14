import jwt from 'jsonwebtoken';
import User from '../../Models/authuser.js';


// ✅ Middleware: Verify JWT Token and Attach User
const auth = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (!token) {
      return res.status(401).json({ message: "Token is required" });
    }

    token = token.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid Token", error: err.message });
      }
      if (decoded.actAs) {
  req.isImpersonating = true;
  req.impersonatedBy = decoded.impersonatedBy;
}


      const user = await User.findById(decoded.id).select("-password -__v");
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Plain password sirf admin/manager ko milega
      if (user.role === "admin" || user.role === "manager") {
        user._doc.plainPassword = decoded.plainPassword || null;
      }

      req.user = user;
      req.userId = user._id;
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};


// ✅ Middleware: Check User Role & 2FA (if required)
const checkRole = (roles = []) => {
  return (req, res, next) => {
    try {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({
          message: `Unauthorized. Requires role: ${roles.join(", ")}`
        });
      }

      // Check 2FA for admin and manager
      if (
        (req.user.role === "admin" || req.user.role === "manager") &&
        !req.user.twoFactorVerified
      ) {
        return res.status(401).json({
          message: "2FA verification required. Please verify your OTP first."
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  };
};

export { auth, checkRole };
