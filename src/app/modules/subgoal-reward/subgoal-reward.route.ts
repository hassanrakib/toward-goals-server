import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validate-request';
import { subgoalRewardValidations } from './subgoal-reward.validation';
import { subgoalRewardControllers } from './subgoal-reward.controller';
import fileUpload from '../../middlewares/file-upload';

const router = express.Router();

router.post(
  '/create-subgoal-reward',
  auth(),
  fileUpload(),
  validateRequest(subgoalRewardValidations.createSubgoalRewardSchema),
  subgoalRewardControllers.createSubgoalReward
);

export const subgoalRewardRoutes = router;
