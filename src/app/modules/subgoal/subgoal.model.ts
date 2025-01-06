import { model, Schema } from 'mongoose';
import { ISubgoalReward, ISubgoal } from './subgoal.interface';
import { isURL } from 'validator';

const rewardSchema = new Schema<ISubgoalReward>({
  name: {
    type: String,
    required: [true, 'Reward name is required'],
    trim: true,
    minlength: [3, 'Reward name must be at least 3 characters long'],
  },
  image: {
    type: String,
    validate: {
      validator: (url: string) => isURL(url),
      message: 'Image must be a valid URL',
    },
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [1, 'Reward price must be a positive number'],
  },
  link: {
    type: String,
    required: [true, 'Reward link is required'],
    validate: {
      validator: (url: string) => isURL(url),
      message: 'Link must be a valid URL',
    },
  },
});

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
  image: {
    type: String,
    validate: {
      validator: (url: string) => isURL(url),
      message: 'Invalid image URL',
    },
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
        validator: (milestones: string[]) => milestones.length >= 2,
        message: 'There must be at least 2 milestones',
      },
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
  reward: {
    type: rewardSchema,
    required: [true, 'Reward information is required'],
  },
  pointsRequired: {
    type: Number,
    required: [true, 'Points required is required'],
    min: [1, 'Points required must be a positive number'],
  },
  isRewarded: {
    type: Boolean,
    default: false,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

export const Subgoal = model<ISubgoal>('Subgoal', subgoalSchema);
