import sanitize from 'sanitize-html';
import {
  HabitDifficultiesName,
  IHabitDifficulties,
} from '../habit/habit.interface';

// snitaize html string before saving to db
export const sanitizeTaskDescription = (description: string) => {
  return sanitize(description, {
    allowedTags: ['h2', 'p', 'span'],
    allowedAttributes: {
      h2: ['class', 'level'],
      p: ['class'],
      span: ['class', 'data-type', 'data-id', 'data-label'],
    },
  });
};

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

export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
