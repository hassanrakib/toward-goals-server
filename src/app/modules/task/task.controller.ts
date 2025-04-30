import httpStatus from 'http-status';
import catchAsync from '../../utils/catch-async';
import sendResponse from '../../utils/send-response';
import { ITimeSpan, TaskCreationData, TaskUpdateData } from './task.interface';
import { Request } from 'express';
import { taskServices } from './task.service';
import { getMulterUploadedFiles } from '../../utils/get-multer-uploads';

const createTimeSpan = catchAsync(
  async (req: Request<{}, {}, ITimeSpan>, res) => {
    const timeSpan = await taskServices.insertTimeSpanIntoDB(
      req.user.username,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Added a new time span',
      data: timeSpan,
    });
  }
);

const createTask = catchAsync(
  async (req: Request<{}, {}, TaskCreationData>, res) => {
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

const getMyTasks = catchAsync(async (req, res) => {
  const { tasks, meta } = await taskServices.fetchMyTasksFromDB(
    req.user.username,
    req.query
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'My tasks are retrieved successfully',
    data: tasks,
    meta,
  });
});

const getTaskTimeSpans = catchAsync(
  async (req: Request<{ taskId?: string }>, res) => {
    const result = await taskServices.fetchTaskTimeSpans(req.params.taskId!);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Task time spans retrieved successfully',
      data: result,
    });
  }
);

const updateTask = catchAsync(
  async (req: Request<{ taskId?: string }, {}, TaskUpdateData>, res) => {
    const result = await taskServices.updateTaskById(
      req.params.taskId!,
      req.body
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Task updated successfully',
      data: result,
    });
  }
);

export const taskControllers = {
  createTimeSpan,
  createTask,
  getMyTasks,
  getTaskTimeSpans,
  updateTask,
};
