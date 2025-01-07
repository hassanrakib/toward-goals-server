import { Request } from 'express';
import catchAsync from '../../utils/catch-async';
import { ISubgoalFromClient } from './subgoal.interface';
import { getMulterUploadedFile } from '../../utils/get-multer-uploads';
import { subgoalServices } from './subgoal.service';
import sendResponse from '../../utils/send-response';
import httpStatus from 'http-status';

const createSubgoal = catchAsync(
  async (req: Request<{}, {}, ISubgoalFromClient>, res) => {
    // get the multer uploaded file
    const rewardImageFile = getMulterUploadedFile(req);

    const subgoal = await subgoalServices.insertSubgoalIntoDB(
      req.user.username,
      req.body,
      rewardImageFile
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Subgoal creation successful',
      data: subgoal,
    });
  }
);

export const sugoalControllers = {
  createSubgoal,
};
