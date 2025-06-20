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
  validateRequest(progressValidations.createGoalProgressSchema),
  progressControllers.createGoalProgress
);

router.get(
  '/my-goals-progress',
  auth(),
  progressControllers.getMyGoalsProgress
);

router.get(
  '/my-subgoals-progress',
  auth(),
  progressControllers.getMySubgoalsProgress
);

router.get(
  '/my-habits-progress',
  auth(),
  progressControllers.getMyHabitsProgress
);

router.get(
  '/my-goal-progress/:goalId/level',
  auth(),
  progressControllers.getMyGoalProgressLevel
);

router.patch(
  '/my-subgoals-progress/:subgoalProgressId',
  auth(),
  validateRequest(progressValidations.updateSubgoalProgressSchema),
  progressControllers.updateSubgoalProgress
);

router.patch(
  '/my-goals-progress/:goalProgressId',
  auth(),
  validateRequest(progressValidations.updateGoalProgressSchema),
  progressControllers.updateGoalProgress
);

export const progressRoutes = router;
