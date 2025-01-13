import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Goal } from '../goal/goal.model';
// import { User } from '../user/user.model';
import { ISubgoal } from './subgoal.interface';
import { Subgoal } from './subgoal.model';
import { addDays, isAfter } from 'date-fns';

const insertSubgoalIntoDB = async (
  goalId: string,
  userUsername: string,
  subgoal: ISubgoal
) => {
  // get the user _id to use it in the goal progress query
  // const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  // make sure goal exists in the db with the goal's _id as it is coming from the client side
  const goal = await Goal.findById(goalId, '_id startDate duration');

  if (!goal) {
    throw new AppError(httpStatus.NOT_FOUND, 'Goal is not valid');
  }

  // don't allow creating subgoal when the goal is already completed
  /**** do it here after creating the goal progress module ****/

  // make sure that this is going to be the only subgoal with isCompleted: false
  // const incompleteSubgoal = await Subgoal.findOne(
  //   { isCompleted: false },
  //   '_id title'
  // );

  // if (incompleteSubgoal) {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     `Complete ${incompleteSubgoal.title} before stepping into your next subgoal.`
  //   );
  // }

  // subgoal can only be created after the goal's startDate
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

  return Subgoal.create(subgoal);
};

export const subgoalServices = {
  insertSubgoalIntoDB,
};
