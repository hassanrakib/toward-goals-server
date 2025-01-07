import { Request } from 'express';
import catchAsync from '../../utils/catch-async';
import { ISubgoalFromClient } from './subgoal.interface';
import { subgoalServices } from './subgoal.service';
import sendResponse from '../../utils/send-response';
import httpStatus from 'http-status';

const createSubgoal = catchAsync(
  async (req: Request<{}, {}, ISubgoalFromClient>, res) => {
    const subgoal = await subgoalServices.insertSubgoalIntoDB(
      req.user.username,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Subgoal creation successful',
      data: subgoal,
    });
  }
);

export const subgoalControllers = {
  createSubgoal,
};
