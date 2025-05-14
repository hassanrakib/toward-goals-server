import { HabitDifficultiesName, IHabitDifficulties } from './habit.interface';

// get completed habit difficulty => "mini" | "plus" | "elite"
export const getCompletedHabitDifficultyName = (
  difficulties: IHabitDifficulties,
  totalCompletedUnits: number
): HabitDifficultiesName | undefined => {
  // if no level of habit difficulty completed return undefined
  let completedDifficultyName: HabitDifficultiesName | undefined;

  for (const [difficultyName, difficultyRequiremnt] of Object.entries(
    difficulties
  )) {
    if (totalCompletedUnits >= difficultyRequiremnt) {
      completedDifficultyName = difficultyName as HabitDifficultiesName;
    }
  }

  // return completed difficulty name
  return completedDifficultyName;
};
