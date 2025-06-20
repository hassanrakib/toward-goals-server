import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { HabitUnitCreationData, HabitCreationData } from './habit.interface';
import { Habit, HabitUnit } from './habit.model';
import { HabitProgress, GoalProgress } from '../progress/progress.model';
import { User } from '../user/user.model';
import { addRecordToAlgoliaIndex } from '../../utils/algolia';
import { Goal } from '../goal/goal.model';
import { addDays, isAfter } from 'date-fns';

const insertHabitUnitIntoDB = async (
  goalId: string,
  userUsername: string,
  habitUnit: HabitUnitCreationData
) => {
  // get the user _id to use it in the goal progress query
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  // make sure goal exists in the db with the goal's _id as it is coming from the client side
  const goal = await Goal.findById(goalId, '_id startDate duration').lean();

  if (!goal) {
    throw new AppError(httpStatus.NOT_FOUND, 'Goal is not valid');
  }

  // get the goal end date
  const goalEndDate = addDays(goal.startDate, goal.duration);

  // if current date is exceeding goal end date
  if (isAfter(new Date(), goalEndDate)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Don't have time to pursue the goal"
    );
  }

  // check if the user is really into the goal
  const progress = await GoalProgress.findOne(
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

  // to avoid duplicate entry both in db and algolia
  // check for duplicate habit unit
  // if found return it from the service
  // Using collation for exact match of the string values but case insensitive way
  const duplicateHabitUnit = await HabitUnit.findOne({
    type: habitUnit.type,
    name: habitUnit.name,
  }).collation({ locale: 'en', strength: 2 });

  if (duplicateHabitUnit) {
    return duplicateHabitUnit;
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
  habit: HabitCreationData
) => {
  // check habit unit existence in the db
  const habitUnit = await HabitUnit.findById(habit.unit, '_id').lean();

  if (!habitUnit) {
    throw new AppError(httpStatus.NOT_FOUND, 'Habit unit id is not valid.');
  }

  // get the user _id to use it in the goal progress query
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  // make sure goal exists in the db with the goal's _id as it is coming from the client side
  const goal = await Goal.findById(goalId, '_id startDate duration').lean();

  if (!goal) {
    throw new AppError(httpStatus.NOT_FOUND, 'Goal is not valid');
  }

  // get the goal end date
  const goalEndDate = addDays(goal.startDate, goal.duration);

  // if current date is exceeding goal end date
  if (isAfter(new Date(), goalEndDate)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Don't have time to pursue the goal"
    );
  }

  // check if the user is really into the goal
  const progress = await GoalProgress.findOne(
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

  // to avoid duplicate entry both in db and algolia
  // check for duplicate habit
  // if found return it from the service
  // Using collation for exact match of the string values but case insensitive way
  const duplicateHabit = await Habit.findOne({
    title: habit.title,
    unit: habit.unit,
    'difficulties.mini': habit.difficulties.mini,
    'difficulties.plus': habit.difficulties.plus,
    'difficulties.elite': habit.difficulties.elite,
  }).collation({ locale: 'en', strength: 2 });

  if (duplicateHabit) {
    return duplicateHabit;
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

const fetchHabitsOfAGoal = async (goalId: string, userUsername: string) => {
  // get the user _id to use it in the goal progress query
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  // check if the user is really into the goal
  const progress = await GoalProgress.findOne(
    { goal: goalId, user: userId },
    '_id'
  ).lean();

  if (!progress) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not into this goal');
  }

  return HabitProgress.find(
    { user: userId, goal: goalId },
    '_id habit'
  ).populate({
    path: 'habit',
    populate: {
      path: 'unit',
    },
  });
};

export const habitServices = {
  insertHabitUnitIntoDB,
  insertHabitIntoDB,
  fetchHabitsOfAGoal,
};
