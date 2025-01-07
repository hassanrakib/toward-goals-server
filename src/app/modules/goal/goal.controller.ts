import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { goalServices } from './goal.service';
import { Request } from 'express';
import { IGoalFromClient } from './goal.interface';
import { getMulterUploadedFile } from '../../utils/get-multer-uploads';

const createGoal = catchAsync(
  async (req: Request<{}, {}, IGoalFromClient>, res) => {
    // get the multer uploaded file
    const goalImageFile = getMulterUploadedFile(req);

    const goal = await goalServices.insertGoalIntoDB(
      req.user.username,
      req.body,
      goalImageFile
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Created a goal successfully',
      data: goal,
    });
  }
);

export const goalControllers = {
  createGoal,
};
