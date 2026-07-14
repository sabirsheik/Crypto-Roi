import rateLimit from "express-rate-limit";

// Reusable factory
const createLimiter = (minutes, limit, message) =>
  rateLimit({
    windowMs: minutes * 60 * 1000,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message },
  });

// OTP limiter → e.g. max 3 OTP per 5 min
export const p2pOtpLimit = createLimiter(
  5,
  3,
  "You can only request OTP 3 times in 5 minutes."
);

// Transfer limiter → e.g. 1 transfer per 5 min
export const p2pTransferLimit = createLimiter(
  5,
  5,
  "You can only perform 1 P2P transfer every 5 minutes."
);
