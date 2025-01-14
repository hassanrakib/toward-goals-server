import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { Request } from 'express';
import {
  HabitProgressFromClient,
  SubgoalProgressFromClient,
} from './progress.interface';
import { progressServices } from './progress.service';

const createSubgoalProgress = catchAsync(
  async (req: Request<{}, {}, SubgoalProgressFromClient>, res) => {
    const subgoalProgress = await progressServices.insertSubgoalProgressIntoDB(
      req.user.username,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Subgoal progress creation successful',
      data: subgoalProgress,
    });
  }
);

const createHabitProgress = catchAsync(
  async (req: Request<{}, {}, HabitProgressFromClient>, res) => {
    const habitProgress = await progressServices.insertHabitProgressIntoDB(
      req.user.username,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Habit progress creation successful',
      data: habitProgress,
    });
  }
);

export const progressControllers = {
  createSubgoalProgress,
  createHabitProgress,
};
