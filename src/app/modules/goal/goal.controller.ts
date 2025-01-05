import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { goalServices } from './goal.service';
import { Request } from 'express';
import { IGoal } from './goal.interface';

const createGoal = catchAsync(async (req: Request<{}, {}, IGoal>, res) => {
  // get the multer uploaded file by accessing req.files
  // const files = req.files as Record<string, Express.Multer.File[]> | undefined;

  console.log(req.files, req.body);

  // const goal = await goalServices.insertGoalIntoDB(req.body, files?.image[0]);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Created a goal successfully',
    // data: goal,
    data: 'test',
  });
});

export const goalControllers = {
  createGoal,
};
