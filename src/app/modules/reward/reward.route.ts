import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validate-request';
import { rewardValidations } from './reward.validation';
import { rewardControllers } from './reward.controller';
import fileUpload from '../../middlewares/file-upload';

const router = express.Router();

router.post(
  '/create-subgoal-reward',
  auth(),
  fileUpload(),
  validateRequest(rewardValidations.createRewardSchema),
  rewardControllers.createReward
);

export const rewardRoutes = router;
