import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import saveImageToCloud from '../../utils/save-image-to-cloud';
import { Subgoal } from '../subgoal/subgoal.model';
import { User } from '../user/user.model';
import {
  ISubgoalReward,
  ISubgoalRewardFromClient,
} from './subgoal-reward.interface';
import { SubgoalReward } from './subgoal-reward.model';

const insertSubgoalRewardIntoDB = async (
  userUsername: string,
  subgoalReward: ISubgoalRewardFromClient,
  rewardImageFile: Express.Multer.File | undefined
) => {
  // get the user _id
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  //   make sure subgoal exists in the db with the id as it is coming from the client side
  const subgoal = await Subgoal.findById(subgoalReward.subgoal, '_id title');

  if (!subgoal) {
    throw new AppError(httpStatus.NOT_FOUND, 'Subgoal is not valid');
  }

  // can not add more than one reward
  const addedSubgoalReward = await SubgoalReward.findOne(
    { subgoal: subgoal._id },
    '_id'
  );

  if (addedSubgoalReward) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Subgoal reward is already added'
    );
  }

  // calculate points, required to redeem the reward
  // for now: 1$ price reward will need = 20 gem points
  const pointsRequired = subgoalReward.price * 20;

  //   add required properties
  const newSubgoalReward: ISubgoalReward = {
    ...subgoalReward,
    user: userId,
    pointsRequired,
  };

  //   upload reward image, if sent from the client side
  if (rewardImageFile) {
    const uniqueSuffix = `${String(Date.now())}-${String(Math.round(Math.random() * 1e9))}`;
    const rewardImageName = `${subgoalReward.name.split(' ').join('-').toLowerCase()}-for-${userUsername}-${uniqueSuffix}`;
    const rewardImageURL = await saveImageToCloud(
      rewardImageName,
      rewardImageFile.path
    );
    newSubgoalReward.image = rewardImageURL;
  }

  return SubgoalReward.create(newSubgoalReward);
};

export const subgoalRewardServices = {
  insertSubgoalRewardIntoDB,
};
