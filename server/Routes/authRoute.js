import express from 'express';
import {
  register,
  login,
  verifyOtp,
  getUserInfo,
  forgotPassword,
  resetPassword,
  updateProfileAndPassword,
  getInfoById,
  // 

  impersonateUser
} from '../Controllers/authControllers.js';

import { auth, checkRole } from '../Middleware/auth/auth.js';
import validate from '../Middleware/Validate.js';
import {
  loginSchema,
  signupSchema,
  verifyOtpSchema,
  updateProfileSchema,
} from '../validator/zod-Validation.js';
import {
  registerLimiter,
  loginLimiter,
  otpLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter
} from '../handlers/rateLimiter.js';

const router = express.Router();

// Apply separate limiters for each critical route
router.post('/register', registerLimiter, validate(signupSchema), register);
router.post('/login', loginLimiter, validate(loginSchema), login);
router.post('/verify-otp-login', otpLimiter, validate(verifyOtpSchema), verifyOtp);
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:id', resetPasswordLimiter, resetPassword);

router.get('/userInfo', auth, getUserInfo);
router.put('/user/update-profile', auth, validate(updateProfileSchema), updateProfileAndPassword);
router.get('/infoId/:id', auth, getInfoById);

// Admin Access User Dashboard

// Impersonate route
router.post(
  "/impersonate/:userId",
  auth,
  checkRole(["admin"]), // only admin + 2FA verified allowed
  impersonateUser
);

export default router;
