import { addRecordToAlgoliaIndex } from '../../utils/algolia';
import saveImageToCloud from '../../utils/save-image-to-cloud';
import { GoalProgress } from '../progress/progress.model';
import { User } from '../user/user.model';
import { IGoal, GoalCreationData } from './goal.interface';
import { Goal } from './goal.model';

const insertGoalIntoDB = async (
  creatorUsername: string,
  goal: GoalCreationData,
  goalImageFile: Express.Multer.File | undefined
) => {
  // get the creator
  const creatorId = (await User.getUserFromDB(creatorUsername, '_id'))!._id;

  const newGoal: IGoal = {
    ...goal,
    // add required properties
    creator: creatorId,
    users: [creatorId],
  };

  // upload goal image, if sent from the client side
  if (goalImageFile) {
    const uniqueSuffix = `${String(Date.now())}-${String(Math.round(Math.random() * 1e9))}`;
    const imageName = `${goal.title.split(' ').join('-').toLowerCase()}-by-${creatorUsername}-${uniqueSuffix}`;
    const goalImageURL = await saveImageToCloud(
      imageName,
      goalImageFile.path,
      'toward-goals/goals'
    );
    newGoal.image = goalImageURL;
  }
  const insertedGoal = await Goal.create(newGoal);

  // insert the record into algolia index for search
  const record = {
    objectID: insertedGoal._id.toString(),
    title: insertedGoal.title,
    image: insertedGoal.image,
    userCount: insertedGoal.users.length,
    userLimit: insertedGoal.userLimit,
    startDate: insertedGoal.startDate.getTime(),
    duration: insertedGoal.duration,
  };

  await addRecordToAlgoliaIndex(record, 'goals');

  return insertedGoal;
};

const fetchMyJoinedGoals = async (
  userUsername: string,
  query: { isCompleted?: boolean }
) => {
  // get the user _id to use it in the query
  const userId = (await User.getUserFromDB(userUsername, '_id'))!._id;

  // get the joined goals from goalprogresses collection
  // just get the goal field using projection from goal progress
  const joinedGoals = GoalProgress.find(
    { ...query, user: userId },
    '_id goal'
  ).populate('goal');

  return joinedGoals;
};

export const goalServices = {
  insertGoalIntoDB,
  fetchMyJoinedGoals,
};
