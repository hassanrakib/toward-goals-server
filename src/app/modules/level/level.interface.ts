import { Types } from 'mongoose';

export enum RequirementsName {
  'Consistency' = 'Consistency',
  'DeepFocus' = 'Deep Focus',
  'Commitment' = 'Commitment',
}

export interface IRequirementLevel {
  name: RequirementsName;
  level: number;
  rewardPointsPerDay: number;
  minPercentage: number;
  maxPercentage: number;
}

export interface ILevel {
  level: number;
  badgeImage: string;
  levelUpPoint: number;
  requirements: {
    consistency: Types.ObjectId;
    deepFocus: Types.ObjectId;
    commitment: Types.ObjectId;
  };
}

export type LevelRequirements = ILevel['requirements'];
