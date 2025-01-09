import { model, Schema } from 'mongoose';
import { IRequirementLevel, RequirementsName } from './level.interface';

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
        return value === this.minPercentage + 9;
      },
      message: 'Maximum percentage must be => minPercentage + 9',
    },
  },
});

export const RequirementLevel = model<IRequirementLevel>(
  'RequirementLevel',
  requirementLevelSchema
);
