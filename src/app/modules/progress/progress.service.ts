import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Subgoal } from '../subgoal/subgoal.model';
import { User } from '../user/user.model';
import {
  HabitProgressCreationData,
  IHabitProgress,
  IGoalProgress,
  ISubgoalProgress,
  GoalProgressCreationData,
  SubgoalProgressCreationData,
  SubgoalProgressUpdateData,
  GoalProgressUpdateData,
} from './progress.interface';
import { HabitProgress, GoalProgress, SubgoalProgress } from './progress.model';
import { Goal } from '../goal/goal.model';
import { Habit } from '../habit/habit.model';
import { Level } from '../level/level.model';
import {
  addDays,
  differenceInDays,
  differenceInMinutes,
  isAfter,
  isBefore,
} from 'date-fns';
import QueryBuilder, { QueryParams } from '../../builder/QueryBuilder';
import { Task } from '../task/task.model';

const insertSubgoalProgressIntoDB = async (
  userUsername: string,
  subgoalProgress: SubgoalProgressCreationData
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
  const goalProgress = await GoalProgress.findOne(
    { goal: goal._id, user: userId },
    '_id isCompleted'
  ).lean();

  if (!goalProgress) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not into this goal');
  }

  if (goalProgress.isCompleted) {
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

  // get the goal end date
  const goalEndDate = addDays(goal.startDate, goal.duration);

  // get the remainng full days to end the goal
  // if the current date is before goal's startDate
  // assign the goal duration
  // otherwise calculate remaining days
  const daysToEndGoal = isBefore(new Date(), goal.startDate)
    ? goal.duration
    : differenceInDays(goalEndDate, new Date());

  // get the remaining minutes after daysToEndGoal
  // if the current date is before goal's startDate
  // assign 0
  // otherwise calculate remaining minutes after getting full days remaining to end the goal
  const remainingMinutesAfterDaysToEndGoal = isBefore(
    new Date(),
    goal.startDate
  )
    ? 0
    : differenceInMinutes(goalEndDate, new Date()) % (24 * 60);

  // if days to end goal is less than 1 day also less than 30 minutes
  if (daysToEndGoal < 1 && remainingMinutesAfterDaysToEndGoal < 30) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Don't have time to pursue the goal"
    );
  }

  // calculate max allowed subgoal duration
  // full days to end goal + if remainingMinutesAfterDaysToEndGoal is greater than 30, add 1 more day
  const maxSubgoalDuration =
    daysToEndGoal + (remainingMinutesAfterDaysToEndGoal >= 30 ? 1 : 0);

  // subgoal duration can not exceed the max subgoal duration
  if (subgoal.duration > maxSubgoalDuration) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Subgoal duration can not exceed ${String(maxSubgoalDuration)} days`
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
  habitProgress: HabitProgressCreationData
) => {
  // get the user _id to use it in the habit progress creation
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  //   check if habit exists
  const habit = await Habit.findById(habitProgress.habit, '_id').lean();

  if (!habit) {
    throw new AppError(httpStatus.NOT_FOUND, 'Habit is not valid');
  }

  // make sure goal exists in the db with the goal's _id as it is coming from the client side
  const goal = await Goal.findById(
    habitProgress.goal,
    '_id startDate duration'
  ).lean();

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

  const newHabitProgress: IHabitProgress = {
    ...habitProgress,
    user: userId,
  };

  return HabitProgress.create(newHabitProgress);
};

const insertGoalProgressIntoDB = async (
  userUsername: string,
  progress: GoalProgressCreationData
) => {
  // get the user _id to use it in the progress creation
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  //   check if goal exists
  const goal = await Goal.findById(progress.goal).lean();

  if (!goal) {
    throw new AppError(httpStatus.NOT_FOUND, 'Goal is not valid');
  }

  //   get the main level
  const mainLevel = await Level.findOne(
    { level: 0 },
    '_id requirements'
  ).lean();

  if (!mainLevel) {
    throw new AppError(httpStatus.NOT_FOUND, 'Level not found');
  }

  //   check if requirement level exists in the db
  // for (const key of Object.keys(progress.analytics)) {
  //   const requirementLevel = await RequirementLevel.findById(
  //     progress.analytics[key as keyof typeof progress.analytics].level,
  //     '_id'
  //   ).lean();

  //   if (!requirementLevel) {
  //     throw new AppError(
  //       httpStatus.NOT_FOUND,
  //       `Requirement level in ${key} is not valid`
  //     );
  //   }
  // }

  // check if the user is already into the goal
  const existingProgress = await GoalProgress.findOne(
    { goal: goal._id, user: userId },
    '_id'
  ).lean();

  if (existingProgress) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are already into the goal');
  }

  const newProgress: IGoalProgress = {
    ...progress,
    level: mainLevel._id,
    analytics: {
      consistency: { level: mainLevel.requirements.consistency._id },
      commitment: { level: mainLevel.requirements.commitment._id },
      deepFocus: { level: mainLevel.requirements.deepFocus._id },
    },
    user: userId,
  };

  return GoalProgress.create(newProgress);
};

const fetchMyGoalsProgressFromDB = async (
  userUsername: string,
  query: QueryParams
) => {
  // get the user _id to use it in the query
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  const goalsProgressQuery = new QueryBuilder(
    GoalProgress.find({ user: userId }),
    query
  )
    .filter()
    .sort()
    .selectFields()
    .paginate();

  const goalsProgress = await goalsProgressQuery.modelQuery
    .populate('user')
    .populate('goal')
    .populate('level')
    .populate([
      { path: 'analytics.consistency.level' },
      { path: 'analytics.deepFocus.level' },
      { path: 'analytics.commitment.level' },
    ]);
  const meta = await goalsProgressQuery.getPaginationInformation();

  return {
    goalsProgress,
    meta,
  };
};

const fetchMySubgoalsProgressFromDB = async (
  userUsername: string,
  query: QueryParams
) => {
  // get the user _id to use it in the query
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  const subgoalsProgressQuery = new QueryBuilder(
    SubgoalProgress.find({ user: userId }),
    query
  )
    .filter()
    .sort()
    .selectFields()
    .paginate();

  const subgoalsProgress = await subgoalsProgressQuery.modelQuery
    .populate('subgoal')
    .populate('goal');

  const meta = await subgoalsProgressQuery.getPaginationInformation();

  return {
    subgoalsProgress,
    meta,
  };
};

const fetchMyHabitsProgressFromDB = async (
  userUsername: string,
  query: QueryParams
) => {
  // get the user _id to use it in the query
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  const habitsProgressQuery = new QueryBuilder(
    HabitProgress.find({ user: userId }),
    query
  )
    .filter()
    .sort()
    .selectFields()
    .paginate();

  const habitsProgress = await habitsProgressQuery.modelQuery
    .populate({
      path: 'habit',
      populate: {
        path: 'unit',
      },
    })
    .populate('goal');

  const meta = await habitsProgressQuery.getPaginationInformation();

  return {
    habitsProgress,
    meta,
  };
};

const fetchMyGoalProgressLevel = async (
  userUsername: string,
  goalId: string
) => {
  // get the user _id to use it in the query
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  // check if goalId is valid
  const goal = await Goal.findById(goalId);

  if (!goal) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Goal not found. Id is not valid.'
    );
  }

  const goalProgress = await GoalProgress.findOne(
    { goal: goalId, user: userId },
    'level'
  )
    .populate('level', 'level')
    .lean();

  // if no goalProgress found
  if (!goalProgress) {
    throw new AppError(httpStatus.NOT_FOUND, 'GoalProgress not found!');
  }

  return goalProgress.level;
};

const updateSubgoalProgressIntoDB = async (
  username: string,
  subgoalProgressId: string,
  subgoalProgressUpdate: SubgoalProgressUpdateData
) => {
  // get the current user _id
  const userId = (await User.getUserFromDB(username, '_id'))!._id;

  // get the subgoalProgress by subgoalProgress id
  const subgoalProgress = await SubgoalProgress.findById(
    subgoalProgressId,
    '_id isCompleted user goal keyMilestones'
  ).lean();

  // check if the subgoalProgress is found or not
  if (!subgoalProgress) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subgoal progress is not found');
  }

  // check whether current user is updating others subgoalProgress
  if (String(userId) !== String(subgoalProgress.user)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not allowed to perform the action'
    );
  }

  //  check if the subgoalProgress is completed
  if (subgoalProgress.isCompleted) {
    throw new AppError(httpStatus.BAD_REQUEST, 'The subgoal is completed');
  }

  // if trying to complete the subgoal and has more than zero task incomplete
  if (subgoalProgressUpdate.isCompleted) {
    // make sure all the tasks of user for the goal is complete
    const inCompleteTaskCount = await Task.countDocuments({
      goal: subgoalProgress.goal,
      user: subgoalProgress.user,
      isCompleted: false,
    });

    if (inCompleteTaskCount > 0) {
      throw new AppError(httpStatus.BAD_REQUEST, 'There is a task incomplete!');
    }
  }

  // if update has keyMilestones then we have to make sure total keyMilestones not greater than 5
  if (subgoalProgressUpdate.keyMilestones) {
    // previously added milestones count + new milestones count
    const totalMilestonesCount =
      subgoalProgressUpdate.keyMilestones.length +
      subgoalProgress.keyMilestones!.length;

    if (totalMilestonesCount > 5) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'No more than 5 key milestones can be added'
      );
    }
  }

  // structure the update
  const update = {
    // if isCompleted field found in update add it to update
    ...(subgoalProgressUpdate.isCompleted
      ? { isCompleted: subgoalProgressUpdate.isCompleted }
      : {}),
    // if keyMilestones field found in update push new key milestones
    ...(subgoalProgressUpdate.keyMilestones
      ? {
          $push: {
            keyMilestones: { $each: subgoalProgressUpdate.keyMilestones },
          },
        }
      : {}),
  };

  // update the subgoalProgress
  const result = await SubgoalProgress.findByIdAndUpdate(
    subgoalProgressId,
    update,
    { runValidators: true, new: true }
  );

  return result;
};

const updateGoalProgressIntoDB = async (
  username: string,
  goalProgressId: string,
  update: GoalProgressUpdateData
) => {
  // get the current user _id
  const userId = (await User.getUserFromDB(username, '_id'))!._id;

  // get the goalProgress by its id
  const goalProgress = await GoalProgress.findById(
    goalProgressId,
    '_id user goal isCompleted'
  ).lean();

  // check if goal progress exists
  if (!goalProgress) {
    throw new AppError(httpStatus.NOT_FOUND, 'The goal progress is not found');
  }

  // check that if current user is trying to update others goalProgress
  if (String(userId) !== String(goalProgress.user)) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not allowed to perform the action'
    );
  }

  // make sure that the goalProgress is not completed
  if (goalProgress.isCompleted) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Goal progress is already completed'
    );
  }

  // make sure all the subgoal progress is complete
  // if all the subgoal progress complete => all the tasks are also complete
  const inCompleteSubgoalProgressCount = await SubgoalProgress.countDocuments({
    goal: goalProgress.goal,
    user: goalProgress.user,
    isCompleted: false,
  });

  if (inCompleteSubgoalProgressCount > 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'There is a subgoal incomplete!'
    );
  }

  // do the update
  const result = await GoalProgress.findByIdAndUpdate(goalProgressId, update, {
    runValidator: true,
    new: true,
  });

  return result;
};

export const progressServices = {
  insertSubgoalProgressIntoDB,
  insertHabitProgressIntoDB,
  insertGoalProgressIntoDB,
  fetchMyGoalsProgressFromDB,
  fetchMySubgoalsProgressFromDB,
  fetchMyHabitsProgressFromDB,
  fetchMyGoalProgressLevel,
  updateSubgoalProgressIntoDB,
  updateGoalProgressIntoDB,
};
