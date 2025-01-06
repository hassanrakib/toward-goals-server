import saveImageToCloud from '../../utils/save-image-to-cloud';
import { User } from '../user/user.model';
import { IGoal } from './goal.interface';
import { Goal } from './goal.model';

const insertGoalIntoDB = async (
  creatorUsername: string,
  goal: IGoal,
  file: Express.Multer.File | undefined
) => {
  // get the creator
  const creatorId = (await User.getUserFromDB(creatorUsername))!._id;

  const newGoal: IGoal = {
    ...goal,
    // add required properties
    creator: creatorId,
    users: [creatorId],
  };

  if (file) {
    const imageName = `${goal.title.split(' ').join('-')}-created-by-${creatorUsername}`;
    const goalImageURL = await saveImageToCloud(imageName, file.path);
    newGoal.image = goalImageURL;
  }
  return Goal.create(newGoal);
};

export const goalServices = {
  insertGoalIntoDB,
};
