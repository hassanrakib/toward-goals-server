import { IRequirementLevel, RequirementsName } from './level.interface';

export const createRequirementsLevels = (): IRequirementLevel[] => {
  //   get the requirements array of requirements name
  const requirements = Object.values(RequirementsName);

  //   variable where we will push every requirement levels
  const requirementsLevels: IRequirementLevel[] = [];

  requirements.forEach((requirement) => {
    // create 9 levels for every requirement and push them
    for (let level = 0; level <= 9; level++) {
      requirementsLevels.push({
        name: requirement,
        level,
        rewardPointsPerDay: level + 1,
        minPercentage: level === 0 ? 0 : level * 10 + 1,
        maxPercentage: level * 10 + 1 + 9,
      });
    }
  });

  return requirementsLevels;
};
