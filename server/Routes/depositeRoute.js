import express from "express";
import multer from "multer";
import path from "path"; 
import {
  submitDeposit,
  getAllDeposits,
  approveDeposit,
  rejectDeposit,
  getMyDeposits,
  deleteDeposit,
} from "../Controllers/depositController.js";
import { auth, checkRole } from "../Middleware/auth/auth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});


const upload = multer({ storage });

// POST /submit-deposit
router.post("/manual", auth, upload.single("screenshot"), submitDeposit);

// GET /get-all-deposits
router.get("/get-all", auth, checkRole(["admin", "manager"]), getAllDeposits);

// PATCH /approve/:id
router.patch("/approve/:id", auth, checkRole(["admin", "manager"]), approveDeposit);

// PATCH /reject/:id
router.patch("/reject/:id", auth, checkRole(["admin", "manager"]), rejectDeposit);

// GET /get-my-deposits
router.get("/my-deposits", auth, getMyDeposits);

// Delete/Deposit
router.delete("/delete-deposits", auth, deleteDeposit);


export default router;
