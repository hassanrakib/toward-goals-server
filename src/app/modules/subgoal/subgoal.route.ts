import express from 'express';
import { subgoalControllers } from './subgoal.controller';
import validateRequest from '../../middlewares/validate-request';
import { subgoalValidations } from './subgoal.validation';
import auth from '../../middlewares/auth';

const router = express.Router();

router.post(
  '/:goalId/create-subgoal',
  auth(),
  validateRequest(subgoalValidations.createSubgoalSchema),
  subgoalControllers.createSubgoal
);

export const subgoalRoutes = router;
