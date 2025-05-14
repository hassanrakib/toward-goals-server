import { calculatePercentage } from '../../utils/calculate-percentage';
import { capitalizeFirstLetter } from '../../utils/capitalize-first-letter';
import { RequirementsName } from '../level/level.interface';
import { Level, RequirementLevel } from '../level/level.model';

export const addAnalyticsUpdateToUpdateObj = async (
  updateObj: Record<string, unknown>,
  successCount: number,
  failureCount: number,
  analyticsFieldName: 'consistency' | 'deepFocus' | 'commitment'
) => {
  // calculate success percentage
  const percentageOfSuccess = calculatePercentage(
    successCount,
    successCount + failureCount
  );

  // query to RequirementLevel to find the new requirement level for an analytics field
  const newLevelForAnalyticsField = await RequirementLevel.findOne(
    {
      name: RequirementsName[
        capitalizeFirstLetter(
          analyticsFieldName
        ) as keyof typeof RequirementsName
      ],
      minPercentage: { $gte: percentageOfSuccess },
    },
    '_id'
  ).lean();

  updateObj[`analytics.${analyticsFieldName}.percent`] = percentageOfSuccess;
  updateObj[`analytics.${analyticsFieldName}.level`] =
    newLevelForAnalyticsField?._id;

  // return percentageOfSuccess
  return [percentageOfSuccess];
};

export const addLevelUpdateToUpdateObj = async (
  updateObj: Record<string, unknown>,
  achievedConsistencyPercentage: number,
  achievedCommitmentPercentage: number,
  achievedDeepFocusPercentage: number
) => {
  // get the new level to update goalProgress
  const newLevel = await Level.findOne(
    {
      'requirements.consistency.minPercentage': {
        $gte: achievedConsistencyPercentage,
      },
      'requirements.commitment.minPercentage': {
        $gte: achievedCommitmentPercentage,
      },
      'requirements.deepFocus.minPercentage': {
        $gte: achievedDeepFocusPercentage,
      },
    },
    '_id'
  ).lean();

  // update level field of update obj
  updateObj.level = newLevel?._id;
};
