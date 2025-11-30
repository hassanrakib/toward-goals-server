import { model, Schema } from 'mongoose';
import {
  HabitUnitNameForTime,
  HabitUnitType,
  IActivity,
  IActivityGroup,
  IElasticHabit,
  IHabit,
  IHabitDifficulties,
  IHabitUnit,
} from './habit.interface';

const habitUnitSchema = new Schema<IHabitUnit>({
  type: {
    type: String,
    enum: {
      values: Object.values(HabitUnitType),
      message: '{VALUE} is not a valid unit type.',
    },
    required: [true, 'Unit type is required.'],
  },
  name: {
    type: String,
    required: [true, 'Unit name is required.'],
    validate: {
      validator: function (name: string) {
        if (this.type === HabitUnitType.Time) {
          return Object.values(HabitUnitNameForTime).includes(
            name as HabitUnitNameForTime
          );
        }
        return true;
      },
      message: `Unit name must be ${HabitUnitNameForTime.Minute} or ${HabitUnitNameForTime.Minute} if the unit type is Time`,
    },
  },
  usageCount: {
    type: Number,
    min: [0, 'Usage count must be at least 0'],
    default: 0,
  },
});

const habitDifficultiesSchema = new Schema<IHabitDifficulties>(
  {
    mini: {
      type: Number,
      required: [true, 'Mini difficulty level is required.'],
      min: [1, 'Mini difficulty must be at least 1.'],
    },
    plus: {
      type: Number,
      required: [true, 'Plus difficulty level is required.'],
      min: [2, 'Plus difficulty must be at least 2.'],
      validate: {
        validator: function (value: number) {
          return value > this.mini;
        },
        message: 'Plus difficulty must be greater than mini difficulty',
      },
    },
    elite: {
      type: Number,
      required: [true, 'Elite difficulty level is required.'],
      min: [3, 'Elite difficulty must be at least 3.'],
      validate: {
        validator: function (value: number) {
          return value > this.plus;
        },
        message: 'Elite difficulty must be greater than plus difficulty',
      },
    },
  },
  { _id: false }
);

const habitSchema = new Schema<IHabit>({
  title: {
    type: String,
    required: [true, 'Habit title is required.'],
    minlength: [3, 'Habit title must be at least 3 characters long.'],
    maxlength: [60, 'Habit title can be at most 60 characters long.'],
    trim: true,
  },
  unit: {
    type: Schema.Types.ObjectId,
    required: [true, 'Habit unit is required.'],
    ref: 'HabitUnit',
  },
  difficulties: {
    type: habitDifficultiesSchema,
    required: [true, 'Habit difficulties are required'],
  },
  usageCount: {
    type: Number,
    min: [0, 'Usage count must be at least 0'],
    default: 0,
  },
});

export const Habit = model<IHabit>('Habit', habitSchema);

export const HabitUnit = model<IHabitUnit>('HabitUnit', habitUnitSchema);


// new habit model


// ------------------------------
// Activity Schema
// ------------------------------
const ActivitySchema = new Schema<IActivity>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: Schema.Types.ObjectId,
      ref: "HabitUnit",
      required: true,
    },
  },
  { _id: false }
);

// ------------------------------
// ActivityGroup Schema
// ------------------------------
const ActivityGroupSchema = new Schema<IActivityGroup>(
  {
    selectionRule: {
      type: String,
      enum: ["required", "oneOf"],
      required: true,
    },
    activities: {
      type: [ActivitySchema],
      required: true,
      validate: {
        validator: (arr: any[]) => arr.length > 0,
        message: "Activities array must have at least one item",
      },
    },
  },
  { _id: false }
);

// ------------------------------
// Elastic Habit Schema
// ------------------------------
const ElasticHabitSchema = new Schema<IElasticHabit>({
  mini: {
    type: [ActivityGroupSchema],
    required: true,
    validate: {
        validator: (arr: any[]) => arr.length > 0,
        message: "Mini difficulty must have at least one item",
    },
  },
  plus: {
    type: [ActivityGroupSchema],
    required: true,
    validate: {
        validator: (arr: any[]) => arr.length > 0,
        message: "Plus difficulty must have at least one item",
    },
  },
  elite: {
    type: [ActivityGroupSchema],
    required: true,
    validate: {
        validator: (arr: any[]) => arr.length > 0,
        message: "Elite difficulty must have at least one item",
    },
  },
  usageCount: {
    type: Number,
    required: true,
    default: 0,
  }
});

export const ElasticHabit = model<IElasticHabit>('ElasticHabit', ElasticHabitSchema);

