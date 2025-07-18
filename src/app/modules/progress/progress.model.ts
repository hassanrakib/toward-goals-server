import { model, Schema } from 'mongoose';
import {
  IHabitProgress,
  IGoalProgress,
  ISubgoalProgress,
} from './progress.interface';

const subgoalProgressSchema = new Schema<ISubgoalProgress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: [true, 'User is required'],
      ref: 'User',
    },
    goal: {
      type: Schema.Types.ObjectId,
      required: [true, 'Goal is required'],
      ref: 'Goal',
    },
    subgoal: {
      type: Schema.Types.ObjectId,
      required: [true, 'Subgoal is required'],
      ref: 'Subgoal',
    },
    keyMilestones: {
      type: [String],
      validate: [
        {
          validator: (milestones: string[]) => milestones.length <= 5,
          message: 'There must be no more than 5 milestones',
        },
        {
          validator: (milestones: string[]) =>
            milestones.every((milestone) => milestone.length >= 5),
          message: 'Each milestone must be at least 5 characters long',
        },
      ],
      default: [],
    },
    reward: {
      type: Schema.Types.ObjectId,
      ref: 'Reward',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    isRewarded: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

const habitProgressSchema = new Schema<IHabitProgress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: [true, 'User is required'],
      ref: 'User',
    },
    goal: {
      type: Schema.Types.ObjectId,
      required: [true, 'Goal is required'],
      ref: 'Goal',
    },
    habit: {
      type: Schema.Types.ObjectId,
      required: [true, 'Habit is required'],
      ref: 'Habit',
    },
    totalUnitCompleted: {
      type: Number,
      min: [0, 'Total completed unit must be a non-negative number'],
      validate: {
        validator: Number.isInteger,
        message: 'Total completed unit must be an integer',
      },
      default: 0,
    },
    miniCompletion: {
      type: Number,
      min: [0, 'Mini completion must be a non-negative number'],
      validate: {
        validator: Number.isInteger,
        message: 'Mini completion must be an integer',
      },
      default: 0,
    },
    plusCompletion: {
      type: Number,
      min: [0, 'Plus completion must be a non-negative number'],
      validate: {
        validator: Number.isInteger,
        message: 'Plus completion must be an integer',
      },
      default: 0,
    },
    eliteCompletion: {
      type: Number,
      min: [0, 'Elite completion must be a non-negative number'],
      validate: {
        validator: Number.isInteger,
        message: 'Elite completion must be an integer',
      },
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const goalProgressSchema = new Schema<IGoalProgress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: [true, 'User is required'],
      ref: 'User',
    },
    goal: {
      type: Schema.Types.ObjectId,
      required: [true, 'Goal is required'],
      ref: 'Goal',
    },
    level: {
      type: Schema.Types.ObjectId,
      required: [true, 'Level is required'],
      ref: 'Level',
    },
    points: {
      type: Number,
      min: [0, 'Points must be a non-negative number'],
      validate: {
        validator: Number.isInteger,
        message: 'Points must be an integer',
      },
      default: 0,
    },
    totalMiniCompletion: {
      type: Number,
      min: [0, 'Total mini completion must be a non-negative number'],
      validate: {
        validator: Number.isInteger,
        message: 'Total mini completion must be an integer',
      },
      default: 0,
    },
    totalPlusCompletion: {
      type: Number,
      min: [0, 'Total plus completion must be a non-negative number'],
      validate: {
        validator: Number.isInteger,
        message: 'Total plus completion must be an integer',
      },
      default: 0,
    },
    totalEliteCompletion: {
      type: Number,
      min: [0, 'Total elite completion must be a non-negative number'],
      validate: {
        validator: Number.isInteger,
        message: 'Total elite completion must be an integer',
      },
      default: 0,
    },
    workStreak: {
      type: {
        current: {
          type: Number,
          required: true,
          min: [0, 'Current work streak must be a non-negative number'],
          validate: {
            validator: Number.isInteger,
            message: 'Current work streak must be an integer',
          },
        },
        streakDates: {
          type: [Date],
          required: true,
        },
      },
      default: { current: 0, streakDates: [] },
    },
    dayStats: {
      type: {
        workedDays: {
          type: Number,
          required: true,
          min: [0, 'Total work days must be a non-negative number'],
          validate: {
            validator: Number.isInteger,
            message: 'Total work days must be an integer',
          },
        },
        skippedDays: {
          type: Number,
          required: true,
          min: [0, 'Skipped days must be a non-negative number'],
          validate: {
            validator: Number.isInteger,
            message: 'Skipped days must be an integer',
          },
        },
      },
      default: { workedDays: 0, skippedDays: 0 },
    },
    todosDeadlines: {
      type: {
        missed: {
          type: Number,
          required: true,
          min: [0, 'Missed deadlines must be a non-negative number'],
          validate: {
            validator: Number.isInteger,
            message: 'Missed deadlines must be an integer',
          },
        },
        met: {
          type: Number,
          required: true,
          min: [0, 'Met deadlines must be a non-negative number'],
          validate: {
            validator: Number.isInteger,
            message: 'Met deadlines must be an integer',
          },
        },
      },
      default: { missed: 0, met: 0 },
    },
    analytics: {
      consistency: {
        percent: {
          type: Number,
          min: [0, 'Consistency percentage must be at least 0'],
          max: [100, 'Consistency percentage cannot exceed 100'],
          default: 0,
        },
        level: {
          type: Schema.Types.ObjectId,
          ref: 'RequirementLevel',
          required: [true, 'Consistency level ID is required'],
        },
      },
      deepFocus: {
        percent: {
          type: Number,
          min: [0, 'Deep focus percentage must be at least 0'],
          max: [100, 'Deep focus percentage cannot exceed 100'],
          default: 0,
        },
        level: {
          type: Schema.Types.ObjectId,
          ref: 'RequirementLevel',
          required: [true, 'Deep focus level ID is required'],
        },
      },
      commitment: {
        percent: {
          type: Number,
          min: [0, 'Commitment percentage must be at least 0'],
          max: [100, 'Commitment percentage cannot exceed 100'],
          default: 0,
        },
        level: {
          type: Schema.Types.ObjectId,
          ref: 'RequirementLevel',
          required: [true, 'Commitment level ID is required'],
        },
      },
    },
    isCompleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const SubgoalProgress = model<ISubgoalProgress>(
  'SubgoalProgress',
  subgoalProgressSchema
);

export const HabitProgress = model<IHabitProgress>(
  'HabitProgress',
  habitProgressSchema
);

export const GoalProgress = model<IGoalProgress>(
  'GoalProgress',
  goalProgressSchema
);
