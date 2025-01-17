import { Request } from 'express';
import catchAsync from '../../utils/catch-async';
import { RewardCreationData } from './reward.interface';
import { getMulterUploadedFile } from '../../utils/get-multer-uploads';
import httpStatus from 'http-status';
import sendResponse from '../../utils/send-response';
import { rewardServices } from './reward.service';

const createReward = catchAsync(
  async (req: Request<{ subgoalId?: string }, {}, RewardCreationData>, res) => {
    // get the multer uploaded file
    const rewardImageFile = getMulterUploadedFile(req);

    const reward = await rewardServices.insertRewardIntoDB(
      req.params.subgoalId!,
      req.user.username,
      req.body,
      rewardImageFile
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Reward creation successful',
      data: reward,
    });
  }
);

export const rewardControllers = {
  createReward,
};
