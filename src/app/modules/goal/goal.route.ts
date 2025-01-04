import express from 'express';
import validateRequest from '../../middlewares/validate-request';
import { goalValidations } from './goal.validation';
import { goalControllers } from './goal.controller';

const router = express.Router();

router.post(
  '/create-goal',
  validateRequest(goalValidations.createGoalSchema),
  goalControllers.createGoal
);

export const goalRoutes = router;
