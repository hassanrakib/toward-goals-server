import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { ITimeSpan } from './task.interface';
import { Request } from 'express';
import { taskServices } from './task.service';

const createTimeSpan = catchAsync(
  async (req: Request<{}, {}, ITimeSpan>, res) => {
    const timeSpan = await taskServices.insertTimeSpanIntoDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Subgoal creation successful',
      data: timeSpan,
    });
  }
);

export const taskControllers = {
  createTimeSpan,
};
