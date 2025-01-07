import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { Goal } from '../goal/goal.model';
import { User } from '../user/user.model';
import { ISubgoal, ISubgoalFromClient } from './subgoal.interface';
import { Subgoal } from './subgoal.model';

const insertSubgoalIntoDB = async (
  userUsername: string,
  subgoal: ISubgoalFromClient
) => {
  // get the user _id
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  // make sure goal exists in the db with the _id as it is coming from the client side
  const goal = await Goal.findById(subgoal.goal, '_id');

  if (!goal) {
    throw new AppError(httpStatus.NOT_FOUND, 'Goal is not valid');
  }

  const newSubgoal: ISubgoal = {
    ...subgoal,
    user: userId,
  };

  return Subgoal.create(newSubgoal);
};

export const subgoalServices = {
  insertSubgoalIntoDB,
};
