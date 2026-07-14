import { z } from "zod";

// Login Schema
const loginSchema = z.object({
  email: z.string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid Email Address" })
    .min(6, { message: "Email must be at least 6 characters" })
    .max(100, { message: "Email must not be more than 100 characters" }),

  password: z.string({ required_error: "Password is required" })
    .trim()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(312, { message: "Password must not be more than 312 characters" })
}).strict();


// Signup Schema
const signupSchema = loginSchema.extend({
  name: z.string({ required_error: "Name is required" })
    .trim()
    .min(3, { message: "Name must be at least 3 characters." })
    .max(25, { message: "Name must not be more than 25 characters." }),

  phone: z.string({ required_error: "Phone is required" })
    .trim()
    .min(10, { message: "Phone number must be at least 10 characters." })
    .max(17, { message: "Phone number must not be more than 17 characters." }),

  country: z.string({ required_error: "Country is required" })
    .trim()
    .min(2, { message: "Country name too short" }),

  refCode: z.string().optional(),
  
  role: z.enum(["user", "admin", "manager"]).optional().default("user"),

  confirmPassword: z.string({ required_error: "Confirm Password is required" })
    .trim()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});


// OTP Schema
const verifyOtpSchema = z.object({
  email: z.string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid Email Address" })
    .min(6, { message: "Email must be at least 6 characters" })
    .max(100, { message: "Email must not be more than 100 characters" }),
  otp: z.string({ required_error: "OTP is required" })
    .trim()
    .length(6, { message: "OTP must be 6 digits" })
});

const updateProfileSchema = z.object({
  name: z.string({ required_error: "Name is required" })
    .trim()
    .min(3, { message: "Name must be at least 3 characters." })
    .max(25, { message: "Name must not be more than 25 characters." }),

  email: z.string({ required_error: "Email is required" })
    .trim()
    .email({ message: "Invalid Email Address" })
    .min(6)
    .max(100),

  phone: z.string({ required_error: "Phone is required" })
    .trim()
    .min(10, { message: "Phone must be at least 10 digits." })
    .max(17),

  country: z.string({ required_error: "Country is required" })
    .trim()
    .min(2, { message: "Country is too short." }),

  currentPassword: z.string().optional(),
  newPassword: z.string().optional()
}).refine((data) => {
  // If one of the passwords is provided, both must be
  if ((data.currentPassword && !data.newPassword) || (!data.currentPassword && data.newPassword)) {
    return false;
  }
  return true;
}, {
  message: "Both currentPassword and newPassword must be provided together.",
  path: ["newPassword"]
}).refine((data) => {
  if (data.newPassword && data.newPassword.length < 8) {
    return false;
  }
  return true;
}, {
  message: "New password must be at least 8 characters.",
  path: ["newPassword"]
});

export {
  signupSchema,
  loginSchema,
  verifyOtpSchema,
  updateProfileSchema,
};

