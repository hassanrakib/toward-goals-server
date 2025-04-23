import { model, Schema } from 'mongoose';
import { ITask, ITimeSpan } from './task.interface';
import { isURL } from 'validator';
import { isAfter, isBefore, isToday } from 'date-fns';

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
    validate: [
      {
        validator: function (endTime: Date) {
          return isAfter(endTime, this.startTime);
        },
        message: 'End time must be after the start time',
      },
      {
        validator: function (endTime: Date) {
          return isBefore(endTime, new Date());
        },
        message: 'End time can not be in future',
      },
    ],
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
    description: {
      type: String,
      required: [true, 'Task description is required'],
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
          validator: (date: Date) => isToday(date),
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
