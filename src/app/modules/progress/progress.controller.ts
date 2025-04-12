import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { Request } from 'express';
import {
  HabitProgressCreationData,
  ProgressCreationData,
  SubgoalProgressCreationData,
} from './progress.interface';
import { progressServices } from './progress.service';

const createSubgoalProgress = catchAsync(
  async (req: Request<{}, {}, SubgoalProgressCreationData>, res) => {
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
  async (req: Request<{}, {}, HabitProgressCreationData>, res) => {
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

const createProgress = catchAsync(
  async (req: Request<{}, {}, ProgressCreationData>, res) => {
    const progress = await progressServices.insertProgressIntoDB(
      req.user.username,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Progress creation successful',
      data: progress,
    });
  }
);

const getMyGoalsProgress = catchAsync(async (req, res) => {
  const { goalsProgress, meta } =
    await progressServices.fetchMyGoalsProgressFromDB(
      req.user.username,
      req.query
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'My goals progress are retrieved successfully',
    data: goalsProgress,
    meta,
  });
});

const getMySubgoalsProgress = catchAsync(async (req, res) => {
  const { subgoalsProgress, meta } =
    await progressServices.fetchMySubgoalsProgressFromDB(
      req.user.username,
      req.query
    );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'My subgoals progress are retrieved successfully',
    data: subgoalsProgress,
    meta,
  });
});

export const progressControllers = {
  createSubgoalProgress,
  createHabitProgress,
  createProgress,
  getMyGoalsProgress,
  getMySubgoalsProgress,
};
