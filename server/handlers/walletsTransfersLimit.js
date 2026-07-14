import rateLimit from "express-rate-limit";

// 🔹 Helper function: har route ke liye limiter create karega
const createTransferLimiter = (message) =>
  rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    limit: 1, // 1 request har 5 min
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { message }, // custom error message
  });

// 🔹 Export individual limiters
export const mainToInvestmentLimit = createTransferLimiter(
  "You can only transfer from Main to Investment once every 5 minutes."
);

export const profitToCashboxLimit = createTransferLimiter(
  "You can only transfer from Profit to Cashbox once every 5 minutes."
);

export const cashboxToWalletLimit = createTransferLimiter(
  "You can only transfer from Cashbox to Wallet once every 5 minutes."
);

export const cashboxToNewSlotLimit = createTransferLimiter(
  "You can only transfer from Cashbox to New Slot once every 5 minutes."
);

export const affiliateToCashboxLimit = createTransferLimiter(
  "You can only transfer from Affiliate to Cashbox once every 5 minutes."
);
