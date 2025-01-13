import { model, Schema } from 'mongoose';
import {
  ILevel,
  IRequirementLevel,
  LevelRequirements,
  RequirementsName,
} from './level.interface';
import validator from 'validator';

const requirementLevelSchema = new Schema<IRequirementLevel>({
  name: {
    type: String,
    enum: Object.values(RequirementsName),
    required: [true, 'Name is required'],
  },
  level: {
    type: Number,
    required: [true, 'Level is required'],
    min: [0, 'Level must be at least 0'],
    max: [9, 'Level cannot exceed 9'],
  },
  rewardPointsPerDay: {
    type: Number,
    required: [true, 'Reward points per day is required'],
    validate: {
      validator: function (value: number): boolean {
        return value === this.level + 1;
      },
      message: 'Reward points per day must be => level number + one',
    },
  },
  minPercentage: {
    type: Number,
    required: [true, 'Minimum percentage is required'],
    validate: {
      validator: function (value: number): boolean {
        if (this.level === 0) return value === 0;

        return value === this.level * 10 + 1;
      },
      message:
        'Minimum percentage must be zero for level zero, for other levels => level number * ten + one',
    },
  },
  maxPercentage: {
    type: Number,
    required: [true, 'Maximum percentage is required'],
    validate: {
      validator: function (value: number): boolean {
        if (this.level === 0) return value === 10;
        return value === this.minPercentage + 9;
      },
      message:
        'Maximum percentage must be 10 for level zero, for other levels => minPercentage + 9',
    },
  },
});

const levelRequirementsSchema = new Schema<LevelRequirements>({
  consistency: {
    type: Schema.Types.ObjectId,
    required: [true, 'Consistency requirement is required'],
  },
  deepFocus: {
    type: Schema.Types.ObjectId,
    required: [true, 'Deep focus requirement is required'],
  },
  commitment: {
    type: Schema.Types.ObjectId,
    required: [true, 'Commitment requirement is required'],
  },
});

const levelSchema = new Schema<ILevel>({
  level: {
    type: Number,
    required: [true, 'Level is required'],
    min: [0, 'Level must be at least 0'],
    max: [9, 'Level cannot exceed 9'],
  },
  badgeImage: {
    type: String,
    required: [true, 'Badge image URL is required'],
    validate: {
      validator: (value: string) => validator.isURL(value),
      message: 'Badge image must be a valid URL',
    },
  },
  levelUpPoint: {
    type: Number,
    required: [true, 'Level-up point is required'],
    validate: {
      validator: function (value: number): boolean {
        return value === this.level * 10 + 10;
      },
      message: 'Level-up point must be equal to level * 10 + 10',
    },
  },
  requirements: {
    type: levelRequirementsSchema,
    required: [true, 'Requirements is required'],
  },
});

export const RequirementLevel = model<IRequirementLevel>(
  'RequirementLevel',
  requirementLevelSchema
);

export const Level = model<ILevel>('Level', levelSchema);
