import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { ITask, ITimeSpan, TaskCreationData } from './task.interface';
import { Task, TimeSpan } from './task.model';
import { User } from '../user/user.model';
import {
  HabitProgress,
  Progress,
  SubgoalProgress,
} from '../progress/progress.model';
import saveImageToCloud from '../../utils/save-image-to-cloud';
import { isBefore } from 'date-fns';
import QueryBuilder, { QueryParams } from '../../builder/QueryBuilder';
import { sanitizeTaskDescription } from './task.util';

const insertTimeSpanIntoDB = async (
  userUsername: string,
  timeSpan: ITimeSpan
) => {
  // get the user _id to use it in the task finding
  // to make sure task belongs the this person
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  // check if provided taskId really exist in the db
  // and make sure this task belongs the this person
  const task = await Task.findOne(
    { _id: timeSpan.task, user: userId },
    '_id isCompleted createdAt'
  ).lean();

  if (!task) {
    throw new AppError(httpStatus.NOT_FOUND, 'Task is not valid');
  }
  // don't allow new time span if the task is already complete
  if (task.isCompleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Task is already completed');
  }

  // make sure that the timespan's startTime is after the task creation time
  if (isBefore(new Date(timeSpan.startTime), new Date(task.createdAt!))) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Timespan start time can not be before the task creation time'
    );
  }

  return TimeSpan.create(timeSpan);
};

const insertTaskIntoDB = async (
  userUsername: string,
  task: TaskCreationData,
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

  // subgoal progress is allowed to create after the goal's startDate
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
  const habitProgress = await HabitProgress.findOne(
    { habit: task.habit, user: userId },
    '_id'
  ).lean();

  if (!habitProgress) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not into the habit');
  }

  // make sure all other tasks for this goal, subgoal & habit are complete
  const incompleteTask = await Task.findOne(
    {
      goal: task.goal,
      subgoal: task.subgoal,
      habit: task.habit,
      isCompleted: false,
    },
    '_id'
  ).lean();

  if (incompleteTask) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You have a task incomplete');
  }
  // new task
  const newTask: ITask = {
    ...task,
    // santize will santize the html
    // to remove dangerous scripts, event handlers, etc from html
    description: sanitizeTaskDescription(task.description),
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
        taskImageFile.path,
        `toward-goals/tasks/${userUsername}`
      );

      newTask.images.push(taskImageURL);
    }
  }

  return Task.create(newTask);
};

const fetchMyTasksFromDB = async (userUsername: string, query: QueryParams) => {
  // get the user _id to use it in the query
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  const tasksQuery = new QueryBuilder(Task.find({ user: userId }), query)
    .filter()
    .sort()
    .selectFields()
    .paginate();

  const tasks = await tasksQuery.modelQuery.populate({
    path: 'habit',
    populate: {
      path: 'unit',
    },
  });

  const meta = await tasksQuery.getPaginationInformation();

  return {
    tasks,
    meta,
  };
};

export const taskServices = {
  insertTimeSpanIntoDB,
  insertTaskIntoDB,
  fetchMyTasksFromDB,
};
