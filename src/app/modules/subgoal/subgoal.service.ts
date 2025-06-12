import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Goal } from '../goal/goal.model';
import { User } from '../user/user.model';
import { ISubgoal } from './subgoal.interface';
import { Subgoal } from './subgoal.model';
import { addDays, differenceInDays, differenceInMinutes } from 'date-fns';
import { GoalProgress, SubgoalProgress } from '../progress/progress.model';
import { addRecordToAlgoliaIndex } from '../../utils/algolia';

const insertSubgoalIntoDB = async (
  goalId: string,
  userUsername: string,
  subgoal: ISubgoal
) => {
  // get the user _id to use it in the goal progress query
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  // make sure goal exists in the db with the goal's _id as it is coming from the client side
  const goal = await Goal.findById(goalId, '_id startDate duration').lean();

  if (!goal) {
    throw new AppError(httpStatus.NOT_FOUND, 'Goal is not valid');
  }

  // don't allow creating subgoal when progress for that goal is not found
  // also, don't allow if the goal progress tells that the user already completed the goal
  const goalProgress = await GoalProgress.findOne(
    { goal: goalId, user: userId },
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

  // get the full days to end the goal
  const daysToEndGoal = differenceInDays(goalEndDate, new Date());

  // get the remaining minutes after daysToEndGoal
  const remainingMinutesAfterDaysToEndGoal =
    differenceInMinutes(goalEndDate, new Date()) % (24 * 60);

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
    daysToEndGoal + remainingMinutesAfterDaysToEndGoal >= 30 ? 1 : 0;

  // subgoal duration can not exceed the max subgoal duration
  if (subgoal.duration > maxSubgoalDuration) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Subgoal duration can not exceed ${String(maxSubgoalDuration)} days`
    );
  }

  // to avoid duplicate entry both in db and algolia
  // check for duplicate subgoal
  // if found return it from the service
  // Using collation for a exact match of the string values but case insensitive way
  const duplicateSubgoal = await Subgoal.findOne({
    title: subgoal.title,
    duration: subgoal.duration,
  }).collation({ locale: 'en', strength: 2 });

  if (duplicateSubgoal) {
    return duplicateSubgoal;
  }

  const insertedSubgoal = await Subgoal.create(subgoal);

  // insert the record into algolia index for search
  const record = {
    objectID: insertedSubgoal._id.toString(),
    title: insertedSubgoal.title,
    duration: insertedSubgoal.duration,
    usageCount: insertedSubgoal.usageCount,
  };

  await addRecordToAlgoliaIndex(record, 'subgoals');

  return insertedSubgoal;
};

const fetchSubgoalsOfAGoal = async (
  goalId: string,
  userUsername: string,
  query: { isCompleted?: boolean }
) => {
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

  return SubgoalProgress.find(
    { goal: goalId, ...query, user: userId },
    '_id subgoal'
  ).populate('subgoal');
};

export const subgoalServices = {
  insertSubgoalIntoDB,
  fetchSubgoalsOfAGoal,
};
