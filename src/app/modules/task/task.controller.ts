import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { ITimeSpan, TaskFromClient } from './task.interface';
import { Request } from 'express';
import { taskServices } from './task.service';
import { getMulterUploadedFiles } from '../../utils/get-multer-uploads';

const createTimeSpan = catchAsync(
  async (req: Request<{}, {}, ITimeSpan>, res) => {
    const timeSpan = await taskServices.insertTimeSpanIntoDB(req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Added a new time span',
      data: timeSpan,
    });
  }
);

const createTask = catchAsync(
  async (req: Request<{}, {}, TaskFromClient>, res) => {
    // get the multer uploaded file
    const taskImageFiles = getMulterUploadedFiles(req);

    const task = await taskServices.insertTaskIntoDB(
      req.user.username,
      req.body,
      taskImageFiles
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Added a new task',
      data: task,
    });
  }
);

export const taskControllers = {
  createTimeSpan,
  createTask,
};
