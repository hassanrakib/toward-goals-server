import { Request } from 'express';
import catchAsync from '../../utils/catch-async';
import { subgoalServices } from './subgoal.service';
import sendResponse from '../../utils/send-response';
import httpStatus from 'http-status';
import { ISubgoal } from './subgoal.interface';

const createSubgoal = catchAsync(
  async (req: Request<{ goalId?: string }, {}, ISubgoal>, res) => {
    const subgoal = await subgoalServices.insertSubgoalIntoDB(
      req.params.goalId!,
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
