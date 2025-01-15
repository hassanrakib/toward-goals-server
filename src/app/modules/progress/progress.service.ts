import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Subgoal } from '../subgoal/subgoal.model';
import { User } from '../user/user.model';
import {
  HabitProgressFromClient,
  IHabitProgress,
  IProgress,
  ISubgoalProgress,
  ProgressFromClient,
  SubgoalProgressFromClient,
} from './progress.interface';
import { HabitProgress, Progress, SubgoalProgress } from './progress.model';
import { Goal } from '../goal/goal.model';
import { Habit } from '../habit/habit.model';
import { Level, RequirementLevel } from '../level/level.model';
import { addDays, isAfter } from 'date-fns';

const insertSubgoalProgressIntoDB = async (
  userUsername: string,
  subgoalProgress: SubgoalProgressFromClient
) => {
  // get the user _id to use it in the subgoal progress creation
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  //   check if goal exists
  const goal = await Goal.findById(
    subgoalProgress.goal,
    '_id startDate duration'
  ).lean();

  if (!goal) {
    throw new AppError(httpStatus.NOT_FOUND, 'Goal is not valid');
  }

  //   check if subgoal exists
  const subgoal = await Subgoal.findById(
    subgoalProgress.subgoal,
    '_id duration'
  ).lean();

  if (!subgoal) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subgoal is not valid');
  }

  // don't allow creating subgoalProgress when progress for the goal is not found
  // also, don't allow if the goal progress tells that the user already completed the goal
  const progress = await Progress.findOne(
    { goal: goal._id, user: userId },
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

  // make sure that there is no subgoalProgress with isCompleted: false for this particular goal & user
  const incompleteSubgoalProgress = await SubgoalProgress.findOne(
    { isCompleted: false, user: userId, goal: goal._id },
    '_id'
  ).lean();

  if (incompleteSubgoalProgress) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `You have a subgoal incomplete within this goal`
    );
  }

  // subgoalProgress can only be created after the goal's startDate
  if (isAfter(new Date(), goal.startDate)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Goal is not yet started');
  }

  // subgoal duration can not exceed the goal end date
  const goalEndDate = addDays(goal.startDate, goal.duration);
  const subgoalEndDate = addDays(new Date(), subgoal.duration);
  if (isAfter(subgoalEndDate, goalEndDate)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Subgoal duration can not exceed the goal end date'
    );
  }

  const newSubgoalProgress: ISubgoalProgress = {
    ...subgoalProgress,
    user: userId,
  };

  return SubgoalProgress.create(newSubgoalProgress);
};

const insertHabitProgressIntoDB = async (
  userUsername: string,
  habitProgress: HabitProgressFromClient
) => {
  // get the user _id to use it in the habit progress creation
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  //   check if habit exists
  const habit = await Habit.findById(habitProgress.habit, '_id').lean();

  if (!habit) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subgoal is not valid');
  }

  // check if the user is really into the goal
  const progress = await Progress.findOne(
    { goal: habitProgress.goal, user: userId },
    '_id isCompleted'
  ).lean();

  if (!progress) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not into this goal');
  }
  // check if the goal is already completed by the user
  if (progress.isCompleted) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already completed the goal'
    );
  }
  // check if there are 3 habits already created for the goal
  const habitProgressCount = await HabitProgress.countDocuments({
    user: userId,
    goal: habitProgress.goal,
  });

  if (habitProgressCount === 3) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already created three habits for this goal'
    );
  }

  const newHabitProgress: IHabitProgress = {
    ...habitProgress,
    user: userId,
  };

  return HabitProgress.create(newHabitProgress);
};

const insertProgressIntoDB = async (
  userUsername: string,
  progress: ProgressFromClient
) => {
  // get the user _id to use it in the progress creation
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  //   check if goal exists
  const goal = await Goal.findById(progress.goal, '_id').lean();

  if (!goal) {
    throw new AppError(httpStatus.NOT_FOUND, 'Goal is not valid');
  }

  //   check if level exists
  const level = await Level.findById(progress.level, '_id').lean();

  if (!level) {
    throw new AppError(httpStatus.NOT_FOUND, 'Level is not valid');
  }

  //   check if requirement level exists in the db
  for (const key of Object.keys(progress.analytics)) {
    const requirementLevel = await RequirementLevel.findById(
      progress.analytics[key as keyof typeof progress.analytics].level,
      '_id'
    ).lean();

    if (!requirementLevel) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        `Requirement level in ${key} is not valid`
      );
    }
  }

  // check if the user is already into the goal
  const existingProgress = await Progress.findOne(
    { goal: goal._id, user: userId },
    '_id'
  ).lean();

  if (existingProgress) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are already into the goal');
  }

  const newProgress: IProgress = {
    ...progress,
    user: userId,
  };

  return Progress.create(newProgress);
};

export const progressServices = {
  insertSubgoalProgressIntoDB,
  insertHabitProgressIntoDB,
  insertProgressIntoDB,
};
