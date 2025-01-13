import { model, Schema } from 'mongoose';
import { ISubgoal } from './subgoal.interface';

const subgoalSchema = new Schema<ISubgoal>({
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
  usageCount: {
    type: Number,
    min: [0, 'Usage count must be at least 0'],
    default: 0,
  },
});

export const Subgoal = model<ISubgoal>('Subgoal', subgoalSchema);
