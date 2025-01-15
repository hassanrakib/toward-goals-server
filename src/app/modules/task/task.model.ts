import { model, Schema } from 'mongoose';
import { ITask, ITimeSpan } from './task.interface';
import { isURL } from 'validator';
import { endOfToday, isAfter, isBefore } from 'date-fns';

const timeSpanSchema = new Schema<ITimeSpan>({
  task: {
    type: Schema.Types.ObjectId,
    required: [true, 'Task is required'],
    ref: 'Task',
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
  },
});

const taskSchema = new Schema<ITask>(
  {
    user: {
      type: Schema.Types.ObjectId,
      required: [true, 'User is required.'],
      ref: 'User',
    },
    goal: {
      type: Schema.Types.ObjectId,
      required: [true, 'Goal is required.'],
      ref: 'Goal',
    },
    subgoal: {
      type: Schema.Types.ObjectId,
      required: [true, 'Subgoal is required.'],
      ref: 'Subgoal',
    },
    habit: {
      type: Schema.Types.ObjectId,
      required: [true, 'Habit is required.'],
      ref: 'Habit',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [50, 'Title cannot exceed 50 characters'],
    },
    completedUnits: {
      type: Number,
      default: 0,
      min: [0, 'Completed units cannot be less than 0.'],
      validate: {
        validator: Number.isInteger,
        message: 'Completed units must be an integer.',
      },
    },
    milestones: {
      type: [String],
      validate: [
        {
          validator: (milestones: string[]) => milestones.length <= 4,
          message: 'There must be no more than 4 milestones',
        },
        {
          validator: (milestones: string[]) =>
            milestones.every((milestone) => milestone.length >= 3),
          message: 'Each milestone must be at least 3 characters long',
        },
      ],
      default: [],
    },
    images: {
      type: [String],
      validate: [
        {
          validator: (urls: string[]) => urls.length <= 5,
          message: 'You can provide a maximum of 5 URLs.',
        },
        {
          validator: (urls: string[]) => urls.every((url) => isURL(url)),
          message: 'Each image must be a valid URL.',
        },
      ],
      default: [],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
      validate: [
        {
          validator: (date: Date) => isAfter(date, new Date()),
          message: 'Deadline must be in the future.',
        },
        {
          validator: (date: Date) => isBefore(date, endOfToday()),
          message: 'Deadline must not exceed today.',
        },
      ],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Task = model<ITask>('Task', taskSchema);
export const TimeSpan = model<ITimeSpan>('TimeSpan', timeSpanSchema);
