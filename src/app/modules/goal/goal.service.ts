import saveImageToCloud from '../../utils/save-image-to-cloud';
import { User } from '../user/user.model';
import { IGoal, IGoalFromClient } from './goal.interface';
import { Goal } from './goal.model';

const insertGoalIntoDB = async (
  creatorUsername: string,
  goal: IGoalFromClient,
  goalImageFile: Express.Multer.File | undefined
) => {
  // get the creator
  const creatorId = (await User.getUserFromDB(creatorUsername))!._id;

  const newGoal: IGoal = {
    ...goal,
    // add required properties
    creator: creatorId,
    users: [creatorId],
  };

  // upload goal image, if sent from the client side
  if (goalImageFile) {
    const uniqueSuffix = `${String(Date.now())}-${String(Math.round(Math.random() * 1e9))}`;
    const imageName = `${goal.title.split(' ').join('-')}-created-by-${creatorUsername}-${uniqueSuffix}`;
    const goalImageURL = await saveImageToCloud(imageName, goalImageFile.path);
    newGoal.image = goalImageURL;
  }
  return Goal.create(newGoal);
};

export const goalServices = {
  insertGoalIntoDB,
};
