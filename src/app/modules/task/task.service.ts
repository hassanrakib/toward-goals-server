import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { ITask, ITimeSpan, TaskFromClient } from './task.interface';
import { Task, TimeSpan } from './task.model';
import { User } from '../user/user.model';
import {
  HabitProgress,
  Progress,
  SubgoalProgress,
} from '../progress/progress.model';
import saveImageToCloud from '../../utils/save-image-to-cloud';

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

const insertTaskIntoDB = async (
  userUsername: string,
  task: TaskFromClient,
  taskImageFiles: Express.Multer.File[] | undefined
) => {
  // get the user _id to use it in the task creation
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  // don't allow creating task when progress for the goal is not found
  // also, don't allow if the goal progress tells that the user already completed the goal
  const progress = await Progress.findOne(
    { goal: task.goal, user: userId },
    '_id isCompleted'
  ).lean();

  if (!progress) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not into this goal');
  }

  if (progress.isCompleted) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already completed the goal'
    );
  }

  // don't allow creating task when subgoal progress for the subgoal is not found
  // also, don't allow if the subgoal progress tells that the user already completed the subgoal
  const subgoalProgress = await SubgoalProgress.findOne(
    {
      user: userId,
      subgoal: task.subgoal,
    },
    '_id isCompleted'
  ).lean();

  if (!subgoalProgress) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not into this subgoal');
  }

  if (subgoalProgress.isCompleted) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can not add a task as the subgoal is already completed'
    );
  }

  // don't allow creating task when habit progress for the habit is not found
  const habitProgress = await HabitProgress.findById(task.habit, '_id').lean();

  if (!habitProgress) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not into the habit');
  }

  const newTask: ITask = {
    ...task,
    user: userId,
  };

  // upload task images, if sent from the client side
  if (taskImageFiles?.length) {
    // as the images are sent
    newTask.images = [];
    for (const taskImageFile of taskImageFiles) {
      const uniqueSuffix = `${String(Date.now())}-${String(Math.round(Math.random() * 1e9))}`;
      const imageName = `${task.title.split(' ').join('-').toLowerCase()}-by-${userUsername}-${uniqueSuffix}`;
      const taskImageURL = await saveImageToCloud(
        imageName,
        taskImageFile.path
      );

      newTask.images.push(taskImageURL);
    }
  }

  return Task.create(newTask);
};

export const taskServices = {
  insertTimeSpanIntoDB,
  insertTaskIntoDB,
};
