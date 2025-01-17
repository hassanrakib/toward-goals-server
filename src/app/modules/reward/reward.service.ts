import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import saveImageToCloud from '../../utils/save-image-to-cloud';
import { SubgoalProgress } from '../progress/progress.model';
import { User } from '../user/user.model';
import { IReward, RewardFromClient } from './reward.interface';
import { Reward } from './reward.model';
import { addRecordToAlgoliaIndex } from '../../utils/algolia';

const insertRewardIntoDB = async (
  subgoalId: string,
  userUsername: string,
  reward: RewardFromClient,
  rewardImageFile: Express.Multer.File | undefined
) => {
  // get the user _id to use it in the subgoal progress query
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  // check that the user is really into this subgoal
  // also the subgoal is not completed by this user
  const subgoalProgress = await SubgoalProgress.findOne(
    {
      user: userId,
      subgoal: subgoalId,
    },
    '_id isCompleted reward'
  ).lean();

  if (!subgoalProgress) {
    throw new AppError(httpStatus.BAD_REQUEST, 'You are not into this subgoal');
  }

  if (subgoalProgress.isCompleted) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'You can not add a reward as the subgoal is already completed'
    );
  }

  if (subgoalProgress.reward) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Reward is already added');
  }

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
      rewardImageFile.path,
      'toward-goals/rewards'
    );
    newReward.image = rewardImageURL;
  }

  // create reward into the db & get the result
  const insertedReward = await Reward.create(newReward);

  // insert the record into algolia index for search
  const record = {
    objectID: insertedReward._id.toString(),
    name: insertedReward.name,
    image: insertedReward.image,
    price: insertedReward.price,
    pointsRequired: insertedReward.pointsRequired,
    usageCount: insertedReward.usageCount,
  };

  await addRecordToAlgoliaIndex(record, 'rewards');

  return insertedReward;
};

export const rewardServices = {
  insertRewardIntoDB,
};
