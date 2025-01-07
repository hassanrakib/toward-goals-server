import saveImageToCloud from '../../utils/save-image-to-cloud';
import { User } from '../user/user.model';
import { ISubgoal, ISubgoalFromClient } from './subgoal.interface';
import { Subgoal } from './subgoal.model';

const insertSubgoalIntoDB = async (
  userUsername: string,
  subgoal: ISubgoalFromClient,
  rewardImageFile: Express.Multer.File | undefined
) => {
  // get the user _id
  const userId = (await User.getUserFromDB(userUsername))!._id;

  // calculate points, required to redeem the reward
  // for now: 1$ price reward will need = 20 gem points
  const pointsRequired = subgoal.reward.price * 20;

  const newSubgoal: ISubgoal = {
    ...subgoal,
    user: userId,
    pointsRequired,
  };

  //   upload reward image, if sent from the client side
  if (rewardImageFile) {
    const uniqueSuffix = `${String(Date.now())}-${String(Math.round(Math.random() * 1e9))}`;
    const rewardImageName = `${subgoal.reward.name.split(' ').join('-')}-for-${subgoal.title.split(' ').join('-')}-by-${userUsername}-${uniqueSuffix}`;
    const rewardImageURL = await saveImageToCloud(
      rewardImageName,
      rewardImageFile.path
    );
    newSubgoal.reward.image = rewardImageURL;
  }

  return Subgoal.create(newSubgoal);
};

export const subgoalServices = {
  insertSubgoalIntoDB,
};
