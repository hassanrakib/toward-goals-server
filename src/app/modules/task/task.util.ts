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

// capitalize first letter
export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// add path to increment $inc operator of an update object
// to increment by specified value to the path
export const addPathToIncOperatorOfUpdateObj = (
  updateObj: Record<string, unknown> & { $inc?: Record<string, number> },
  path: string,
  value: number
) => {
  // copy if previously updateObj.$inc has paths or assign empty object
  // it is necessary because you can't directly assign value to updateObj.$inc["path"]
  // as updateObj.$inc can be undefined
  updateObj.$inc = updateObj.$inc ?? {};

  // add new path to $inc
  updateObj.$inc[path] = value;
};
