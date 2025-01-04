import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { goalServices } from './goal.service';
import { Request } from 'express';
import { IGoal } from './goal.interface';

const createGoal = catchAsync(async (req: Request<{}, {}, IGoal>, res) => {
  const goal = await goalServices.insertGoalIntoDB(req.body);

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
