import express from 'express';
const router = express.Router();

// import validate from '../Middleware/Validate.js';
import { auth, checkRole } from '../../Middleware/auth/auth.js';
// import investmentPlanSchema from '../validator/investmentPlanSchema.js';

import {
  getPlans,
  deletePlan,
  getSinglePlan,
  updatePlan,
  createPlan
} from '../../Controllers/admin/investmentPlansControllers.js';


router.get('/', getPlans);
router.delete('/delete/:id', [auth, checkRole(["admin", "manager"])], deletePlan);
router.get('/:id', [auth, checkRole(["admin", "manager"])], getSinglePlan);
router.put('/update/:id', [auth, checkRole(["admin", "manager"])], updatePlan);
router.post("/create", [auth, checkRole(["admin", "manager"])], createPlan);


export default router;
