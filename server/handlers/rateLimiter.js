// Middleware/limiter.js
import rateLimit from "express-rate-limit";

// 🔹 Register limiter: 5 requests per 5 minutes per IP
export const registerLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // max 5 requests
  message: {
    success: false,
    message: "Too many register attempts. Please try again after 5 minutes.",
  },
  standardHeaders: true, // Return rate limit info in the headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
});

// 🔹 Login limiter
export const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many login attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🔹 OTP Verify limiter
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: "Too many OTP verification attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🔹 Forgot password limiter
export const forgotPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,
  message: {
    success: false,
    message: "Too many forgot password requests. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 🔹 Reset password limiter
export const resetPasswordLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  message: {
    success: false,
    message: "Too many reset password attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
