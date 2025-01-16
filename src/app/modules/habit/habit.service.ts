import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IHabit, IHabitUnit } from './habit.interface';
import { Habit, HabitUnit } from './habit.model';
import { HabitProgress, Progress } from '../progress/progress.model';
import { User } from '../user/user.model';
import { addRecordToAlgoliaIndex } from '../../utils/algolia';

const insertHabitUnitIntoDB = async (
  goalId: string,
  userUsername: string,
  habitUnit: IHabitUnit
) => {
  // get the user _id to use it in the goal progress query
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  // check if the user is really into the goal
  const progress = await Progress.findOne(
    { goal: goalId, user: userId },
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
    goal: goalId,
  });

  if (habitProgressCount === 3) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already created three habits for this goal'
    );
  }

  const insertedHabitUnit = await HabitUnit.create(habitUnit);

  // insert the record into algolia index for search
  const record = {
    objectID: insertedHabitUnit._id.toString(),
    type: insertedHabitUnit.type,
    name: insertedHabitUnit.name,
    usageCount: insertedHabitUnit.usageCount,
  };

  await addRecordToAlgoliaIndex(record, 'habitUnits');

  return insertedHabitUnit;
};

const insertHabitIntoDB = async (
  goalId: string,
  userUsername: string,
  habit: IHabit
) => {
  // check habit unit existence in the db
  const habitUnit = await HabitUnit.findById(habit.unit, '_id');

  if (!habitUnit) {
    throw new AppError(httpStatus.NOT_FOUND, 'Habit unit id is not valid.');
  }

  // get the user _id to use it in the goal progress query
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  // check if the user is really into the goal
  const progress = await Progress.findOne(
    { goal: goalId, user: userId },
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
    goal: goalId,
  });

  if (habitProgressCount === 3) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You have already created three habits for this goal'
    );
  }
  const insertedHabit = await Habit.create(habit);

  // insert the record into algolia index for search
  const record = {
    objectID: insertedHabit._id.toString(),
    title: insertedHabit.title,
    difficulties: insertedHabit.difficulties,
    usageCount: insertedHabit.usageCount,
  };

  await addRecordToAlgoliaIndex(record, 'habits');

  return insertedHabit;
};

export const habitServices = {
  insertHabitUnitIntoDB,
  insertHabitIntoDB,
};
