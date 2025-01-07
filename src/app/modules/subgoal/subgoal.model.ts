import { model, Schema } from 'mongoose';
import { ISubgoal } from './subgoal.interface';

const subgoalSchema = new Schema<ISubgoal>({
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
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [50, 'Title cannot exceed 50 characters'],
  },
  duration: {
    type: Number,
    required: [true, 'Duration is required'],
    min: [1, 'Duration must be at least 1 day'],
    max: [365, 'Duration cannot exceed 1 year'],
  },
  keyMilestones: {
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
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

export const Subgoal = model<ISubgoal>('Subgoal', subgoalSchema);
