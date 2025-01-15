import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { ITimeSpan } from './task.interface';
import { Task, TimeSpan } from './task.model';

const insertTimeSpanIntoDB = async (timeSpan: ITimeSpan) => {
  // check if provided taskId really exist in the db
  const task = await Task.findById(timeSpan.task, '_id isCompleted').lean();

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, 'Task is not valid');
  }
  // don't allow new time span if the task is already complete
  if (task.isCompleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Task is already completed');
  }

  return TimeSpan.create(timeSpan);
};

export const taskServices = {
  insertTimeSpanIntoDB,
};
