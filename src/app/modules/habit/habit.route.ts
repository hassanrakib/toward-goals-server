import express from 'express';
import validateRequest from '../../middlewares/validate-request';
import auth from '../../middlewares/auth';
import { habitValidations } from './habit.validation';
import { habitControllers } from './habit.controller';

const router = express.Router();

router.post(
  '/:goalId/create-habit-unit',
  auth(),
  validateRequest(habitValidations.createHabitUnitSchema),
  habitControllers.createHabitUnit
);

router.post(
  '/:goalId/create-habit',
  auth(),
  validateRequest(habitValidations.createHabitSchema),
  habitControllers.createHabit
);

export const habitRoutes = router;
