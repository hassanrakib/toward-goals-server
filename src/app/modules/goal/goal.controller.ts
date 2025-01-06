import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { goalServices } from './goal.service';
import { Request } from 'express';
import { IGoal } from './goal.interface';

const createGoal = catchAsync(async (req: Request<{}, {}, IGoal>, res) => {
  // get the multer uploaded file by accessing req.files
  let file: Express.Multer.File | undefined = undefined;

  if (req.files && Object.keys(req.files).includes('image')) {
    file = (req.files as Record<string, Express.Multer.File[]>).image[0];
  }

  const goal = await goalServices.insertGoalIntoDB(
    req.user.username,
    req.body,
    file
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Created a goal successfully',
    data: goal,
  });
});

export const goalControllers = {
  createGoal,
};
