import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { goalServices } from './goal.service';
import { Request } from 'express';
import { GoalCreationData } from './goal.interface';
import { getMulterUploadedFile } from '../../utils/get-multer-uploads';

const createGoal = catchAsync(
  async (req: Request<{}, {}, GoalCreationData>, res) => {
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

// get user specific joined goals
const getMyJoinedGoals = catchAsync(async (req, res) => {
  const joinedGoals = await goalServices.fetchMyJoinedGoals(
    req.user.username,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'My joined goals are retrieved successfully',
    data: joinedGoals,
  });
});

export const goalControllers = {
  createGoal,
  getMyJoinedGoals,
};
