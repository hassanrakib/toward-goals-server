import { IGoal } from './goal.interface';
import { Goal } from './goal.model';

const insertGoalIntoDB = async (
  goal: IGoal,
  file: Express.Multer.File | undefined
) => {
  return Goal.create(goal);
};

export const goalServices = {
  insertGoalIntoDB,
};
