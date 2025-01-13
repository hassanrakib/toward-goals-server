import { Request } from 'express';
import catchAsync from '../../utils/catch-async';
import { ISubgoalRewardFromClient } from './subgoal-reward.interface';
import { getMulterUploadedFile } from '../../utils/get-multer-uploads';
import httpStatus from 'http-status';
import sendResponse from '../../utils/send-response';
import { subgoalRewardServices } from './subgoal-reward.service';

const createSubgoalReward = catchAsync(
  async (req: Request<{}, {}, ISubgoalRewardFromClient>, res) => {
    // get the multer uploaded file
    const rewardImageFile = getMulterUploadedFile(req);

    const subgoalReward = await subgoalRewardServices.insertSubgoalRewardIntoDB(
      req.body,
      rewardImageFile
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Subgoal reward creation successful',
      data: subgoalReward,
    });
  }
);

export const subgoalRewardControllers = {
  createSubgoalReward,
};
