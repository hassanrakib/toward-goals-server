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
      // percentageOfSuccess must fall withing the range of minPercentage & maxPercentage
      minPercentage: { $lte: percentageOfSuccess },
      maxPercentage: { $gte: percentageOfSuccess },
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
  // the minimum successful analytics of different analytics
  let minimumSuccessfulAnalytics: {
    fieldNameInLevelRequirements: string;
    percentage: number;
  };

  // update minimumSuccessfulAnalytics based on minimum achieved percentage
  switch (
    Math.min(
      achievedConsistencyPercentage,
      achievedCommitmentPercentage,
      achievedDeepFocusPercentage
    )
  ) {
    case achievedConsistencyPercentage:
      minimumSuccessfulAnalytics = {
        fieldNameInLevelRequirements: 'consistency',
        percentage: achievedConsistencyPercentage,
      };
      break;
    case achievedCommitmentPercentage:
      minimumSuccessfulAnalytics = {
        fieldNameInLevelRequirements: 'commitment',
        percentage: achievedCommitmentPercentage,
      };
      break;
    default:
      minimumSuccessfulAnalytics = {
        fieldNameInLevelRequirements: 'deepFocus',
        percentage: achievedDeepFocusPercentage,
      };
  }

  // get the new level to update goalProgress
  const newLevel = await Level.findOne(
    // matching minimumSuccessfulAnalytics percentage in the range of
    // level.requirements metric's minPercentage & maxPercentage
    {
      [`requirements.${minimumSuccessfulAnalytics.fieldNameInLevelRequirements}.minPercentage`]:
        {
          $lte: minimumSuccessfulAnalytics.percentage,
        },
      [`requirements.${minimumSuccessfulAnalytics.fieldNameInLevelRequirements}.maxPercentage`]:
        {
          $gte: minimumSuccessfulAnalytics.percentage,
        },
    },
    '_id'
  ).lean();

  // update level field of update obj
  updateObj.level = newLevel?._id;
};
