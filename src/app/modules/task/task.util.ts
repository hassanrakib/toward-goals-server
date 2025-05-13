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

// add path to operators like $inc, $push of a mongodb update object
export const addPathToOperatorOfUpdateObj = (
  updateObj: Record<string, unknown>,
  operator: string,
  path: string,
  value: unknown
) => {
  // copy if previously updateObj[operator] has paths or assign empty object
  // it is necessary because you can't directly assign value to updateObj[operator][path]
  // as updateObj[operator] can be undefined
  if (!updateObj[operator]) {
    updateObj[operator] = {};
  }

  // add new path to operator
  (updateObj[operator] as Record<string, unknown>)[path] = value;
};
