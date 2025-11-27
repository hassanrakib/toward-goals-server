import { model, Schema } from 'mongoose';
import {
  HabitUnitNameForTime,
  HabitUnitType,
  IActivity,
  IHabit,
  IHabitDifficulties,
  IHabitUnit,
  IOptionGroup,
  ITask,
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

// ------------------------------------------
// 1. TASK SCHEMA
// ------------------------------------------
const TaskSchema = new Schema<ITask>(
  {
    type: {
      type: String,
      enum: ["direct", "reference"],
      default: "direct",
      required: true,
    },

    // DIRECT task fields
    count: { type: Number },
    unit: { type: String },

    // REFERENCE task fields
    refActivity: { type: Schema.Types.ObjectId, ref: "Activity" },
    refLevel: { type: String, enum: ["mini", "plus", "elite"] },
  },
  { _id: false }
);

// Conditional validation
TaskSchema.pre("validate", function (next) {
  if (this.type === "direct") {
    if (!this.count || !this.unit) {
      return next(new Error("Direct task requires count and unit"));
    }
  }

  if (this.type === "reference") {
    if (!this.refActivity || !this.refLevel) {
      return next(new Error("Reference task requires refActivity and refLevel"));
    }
  }

  next();
});

// ------------------------------------------
// 2. OPTION GROUP (OR / AND logic)
// ------------------------------------------
const OptionGroupSchema = new Schema<IOptionGroup>(
  {
    description: { type: String }, // optional label
    selectionType: {
      type: String,
      enum: ["required", "oneOf"],
      default: "required",
    },
    tasks: {
      type: [TaskSchema],
      default: [],
    },
  },
  { _id: false }
);

// ------------------------------------------
// 3. ACTIVITY SCHEMA
// ------------------------------------------
const ActivitySchema = new Schema<IActivity>({
  name: { type: String, required: true }, // "Bike", "Gym", etc.

  userId: { type: Schema.Types.ObjectId, ref: "User" },

  levels: {
    mini: { type: [OptionGroupSchema], default: [] },
    plus: { type: [OptionGroupSchema], default: [] },
    elite: { type: [OptionGroupSchema], default: [] },
  },
});

module.exports = model<IActivity>("Activity", ActivitySchema);
