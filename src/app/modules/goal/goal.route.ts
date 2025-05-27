import express from 'express';
import validateRequest from '../../middlewares/validate-request';
import { goalValidations } from './goal.validation';
import { goalControllers } from './goal.controller';
import fileUpload from '../../middlewares/file-upload';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/create-goal',
  auth(),
  fileUpload(),
  validateRequest(goalValidations.createGoalSchema),
  goalControllers.createGoal
);

router.get('/my-joined-goals', auth(), goalControllers.getMyJoinedGoals);

export const goalRoutes = router;
