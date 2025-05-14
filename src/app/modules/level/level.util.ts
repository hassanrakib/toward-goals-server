import { ILevel, IRequirementLevel, RequirementsName } from './level.interface';
import { RequirementLevel } from './level.model';

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
        maxPercentage: level === 0 ? 10 : level * 10 + 1 + 9,
      });
    }
  });

  return requirementsLevels;
};

const getRequirementLevel = async (
  requirementName: RequirementsName,
  level: number
) => {
  const requirementLevel = await RequirementLevel.findOne({
    name: requirementName,
    level,
  }).lean();

  if (!requirementLevel) {
    throw new Error('Error in getting requirementLevel');
  }

  return requirementLevel;
};

export const createLevels = async () => {
  // keep the badge images in the ascending order of levels
  const badgeImages = [
    'https://img.icons8.com/color/48/0-cute.png',
    'https://img.icons8.com/arcade/48/1-circle-c.png',
    'https://img.icons8.com/arcade/48/1-circle-c.png',
    'https://img.icons8.com/arcade/48/1-circle-c.png',
    'https://img.icons8.com/arcade/48/1-circle-c.png',
    'https://img.icons8.com/arcade/48/1-circle-c.png',
    'https://img.icons8.com/arcade/48/1-circle-c.png',
    'https://img.icons8.com/arcade/48/1-circle-c.png',
    'https://img.icons8.com/arcade/48/1-circle-c.png',
    'https://img.icons8.com/arcade/48/1-circle-c.png',
  ];
  const levels: ILevel[] = [];
  // create levels and push them to the levels variable
  for (let level = 0; level <= 9; level++) {
    levels.push({
      level,
      badgeImage: badgeImages[level],
      levelUpPoint: level * 10 + 10,
      requirements: {
        consistency: await getRequirementLevel(
          RequirementsName.Consistency,
          level
        ),
        deepFocus: await getRequirementLevel(RequirementsName.DeepFocus, level),
        commitment: await getRequirementLevel(
          RequirementsName.Commitment,
          level
        ),
      },
    });
  }

  return levels;
};
