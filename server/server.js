import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./Config/dbConnect.js";

import authRoutes from "./Routes/authRoute.js";
import contactRoute from "./Routes/contactRoute.js";
import investmentPlansRoutes from "./Routes/admin/investmentPlansRoute.js";
import commissionLogsRoute from "./Routes/admin/commissionLogsRoute.js";
import mlmTreeRoute from "./Routes/admin/mlmTreeRoute.js";
import userControlRoute from "./Routes/admin/userControlRoute.js";
import depositRoutes from "./Routes/depositeRoute.js";
import errorMiddleware from "./Middleware/errorMiddleware.js";
import runDailyRoiCron from "./utils/roiCronJob.js";
import walletRoutes from "./Routes/walletRoute.js";
import p2pRoutes from "./Routes/p2pRoutes.js";
import withdrawalRoutes from "./Routes/withdrawal.js";
import dashboardRoute from "./Routes/admin/dashboardRoute.js";
import accessRoute from "./Routes/admin/AccessRoute.js"
import transactionHistoryRoute from "./Routes/admin/TransactionHistoryRoute.js"
import NotificationAlertRoute from "./Routes/admin/NotificationAlertRoute.js"
// Super Admin
import superAdminRoute from "./Routes/admin/superAdminRoute.js";
import superAdminControllersRoute from "./Routes/admin/superAdminControllersRoute.js"


// manager
import supportMessageRoute from "./Routes/manager/supportMessageRoute.js"



dotenv.config();
const app = express();


connectDB();

//  CORS setup
const corsOptions = {
//  origin: "http://localhost:5173", 
  origin: "https://crypto-roi-client.vercel.app",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));

//  Fix 413 Error: Allow larger request bodies
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

//  Logger
app.use(morgan("dev"));


//  Routes
app.use("/api", authRoutes);
app.use("/api", contactRoute);
app.use("/api/admin", userControlRoute);
app.use("/api/admin", dashboardRoute);
app.use("/api/access", accessRoute);
app.use("/api", transactionHistoryRoute);
app.use("/api/admin", NotificationAlertRoute);
app.use("/api/admin/mlm-tree", mlmTreeRoute);
app.use("/api/investment-plans", investmentPlansRoutes);
app.use("/api", commissionLogsRoute);
app.use("/api/deposit", depositRoutes);
app.use("/api/wallets", walletRoutes);
app.use("/api/p2pTransfer", p2pRoutes);
app.use("/api/withdrawals", withdrawalRoutes);
// Super Admin
app.use("/api/admin", superAdminRoute);
app.use("/api/admin", superAdminControllersRoute);
// manager
app.use("/api/auth", supportMessageRoute);


// Static file support
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ROI Cron Job
runDailyRoiCron();


// Error Middleware
app.use(errorMiddleware);

// Health Check
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running at http://127.0.0.1:${PORT}`);
});
