import express from "express";
import { createSupportMessage, getAllSupportMessages } from "../../Controllers/manager/managerSupport.js";

import { auth, checkRole } from "../../Middleware/auth/auth.js";


const router = express.Router();

// POST - New Support Message
router.post("/support", auth, createSupportMessage);

// GET - All Support Messages
router.get("/support", auth, checkRole(["manager"]), getAllSupportMessages);

export default router;
