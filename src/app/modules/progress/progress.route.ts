import express from 'express';
import validateRequest from '../../middlewares/validate-request';
import auth from '../../middlewares/auth';
import { progressValidations } from './progress.validation';
import { progressControllers } from './progress.controller';

const router = express.Router();

router.post(
  '/create-subgoal-progress',
  auth(),
  validateRequest(progressValidations.createSubgoalProgressSchema),
  progressControllers.createSubgoalProgress
);

router.post(
  '/create-habit-progress',
  auth(),
  validateRequest(progressValidations.createHabitProgressSchema),
  progressControllers.createHabitProgress
);

router.post(
  '/create-goal-progress',
  auth(),
  validateRequest(progressValidations.createProgressSchema),
  progressControllers.createProgress
);

router.get(
  '/my-goals-progress',
  auth(),
  progressControllers.getMyGoalsProgress
);

export const progressRoutes = router;
