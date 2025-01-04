import { IGoal } from './goal.interface';
import { Goal } from './goal.model';

const insertGoalIntoDB = async (goal: IGoal) => {
  return Goal.create(goal);
};

export const goalServices = {
  insertGoalIntoDB,
};
