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

const insertSubgoalProgressIntoDB = async (
  userUsername: string,
  subgoalProgress: SubgoalProgressFromClient
) => {
  // get the user _id to use it in the subgoal progress creation
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  //   check if goal exists
  const goal = await Goal.findById(subgoalProgress.goal, '_id').lean();

  if (!goal) {
    throw new AppError(httpStatus.NOT_FOUND, 'Goal is not valid');
  }

  //   check if subgoal exists
  const subgoal = await Subgoal.findById(subgoalProgress.subgoal, '_id').lean();

  if (!subgoal) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subgoal is not valid');
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

  //   check if goal exists
  const goal = await Goal.findById(habitProgress.goal, '_id').lean();

  if (!goal) {
    throw new AppError(httpStatus.NOT_FOUND, 'Goal is not valid');
  }

  //   check if habit exists
  const habit = await Habit.findById(habitProgress.habit, '_id').lean();

  if (!habit) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subgoal is not valid');
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
