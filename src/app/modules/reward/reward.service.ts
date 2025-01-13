// import httpStatus from 'http-status';
// import AppError from '../../errors/AppError';
import saveImageToCloud from '../../utils/save-image-to-cloud';
// import { Subgoal } from '../subgoal/subgoal.model';
// import { User } from '../user/user.model';
import { IReward, RewardFromClient } from './reward.interface';
import { Reward } from './reward.model';

const insertRewardIntoDB = async (
  // userUsername: string,
  reward: RewardFromClient,
  rewardImageFile: Express.Multer.File | undefined
) => {
  // get the user _id
  // const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  //   make sure subgoal exists in the db with the id as it is coming from the client side
  // const subgoal = await Subgoal.findById(subgoalReward.subgoal, '_id title');

  // if (!subgoal) {
  //   throw new AppError(httpStatus.NOT_FOUND, 'Subgoal is not valid');
  // }

  // can not add more than one reward
  // const addedSubgoalReward = await SubgoalReward.findOne(
  //   { subgoal: subgoal._id },
  //   '_id'
  // );

  // if (addedSubgoalReward) {
  //   throw new AppError(
  //     httpStatus.BAD_REQUEST,
  //     'Subgoal reward is already added'
  //   );
  // }

  // calculate points, required to redeem the reward
  // for now: 1$ price reward will need = 20 gem points
  const pointsRequired = reward.price * 20;

  //   add required properties
  const newReward: IReward = {
    ...reward,
    pointsRequired,
  };

  //   upload reward image, if sent from the client side
  if (rewardImageFile) {
    const uniqueSuffix = `${String(Date.now())}-${String(Math.round(Math.random() * 1e9))}`;
    const rewardImageName = `${reward.name.split(' ').join('-').toLowerCase()}-${uniqueSuffix}`;
    const rewardImageURL = await saveImageToCloud(
      rewardImageName,
      rewardImageFile.path
    );
    newReward.image = rewardImageURL;
  }

  return Reward.create(newReward);
};

export const rewardServices = {
  insertRewardIntoDB,
};
